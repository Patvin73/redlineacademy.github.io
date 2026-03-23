window.lmsConfig = window.lmsConfig || {};
window.lmsConfig.supabaseUrl =
  window.lmsConfig.supabaseUrl ||
  "https://vsxvojjqmryjncgrilku.supabase.co";
window.lmsConfig.supabaseAnonKey =
  window.lmsConfig.supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeHZvampxbXJ5am5jZ3JpbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTIyMjQsImV4cCI6MjA4ODE4ODIyNH0.SayRUStP0bdnOjSZvg4xKmQNoRQ0cYxeLoe7rYp8L5s";
window.lmsConfig.enableStaff = window.lmsConfig.enableStaff === true;

window.lmsSupabase = (() => {
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase SDK gagal dimuat.");
  }

  const runtimeConfig =
    window.__LMS_SUPABASE_CONFIG__ ||
    window.__lmsSupabaseConfig__ ||
    {};
  window.lmsConfig.enableStaff =
    runtimeConfig.enableStaff === true || window.lmsConfig.enableStaff === true;
  const supabaseUrl = runtimeConfig.supabaseUrl || window.lmsConfig.supabaseUrl;
  const supabaseAnonKey =
    runtimeConfig.supabaseAnonKey || window.lmsConfig.supabaseAnonKey;
  const missingConfig =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "YOUR_SUPABASE_URL" ||
    supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

  if (missingConfig) {
    throw new Error("Konfigurasi Supabase belum diisi di js/supabase-client.js");
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  function makeDeniedQuery(message) {
    const deniedResult = Promise.resolve({
      data: null,
      error: { message },
    });

    const chain = {
      eq() {
        return chain;
      },
      match() {
        return chain;
      },
      select() {
        return chain;
      },
      single() {
        return deniedResult;
      },
      maybeSingle() {
        return deniedResult;
      },
      then(onFulfilled, onRejected) {
        return deniedResult.then(onFulfilled, onRejected);
      },
    };

    return chain;
  }

  function shouldBlockProfileMutation(payload) {
    if (window.__LMS_ALLOW_PROFILE_PRIVILEGED_WRITE__ === true) {
      return false;
    }

    const sensitiveFields = ["role", "student_id", "admin_id", "is_active", "email"];
    return (
      payload &&
      typeof payload === "object" &&
      sensitiveFields.some((field) => Object.prototype.hasOwnProperty.call(payload, field))
    );
  }

  const originalFrom = client.from.bind(client);
  client.from = (tableName, ...args) => {
    const builder = originalFrom(tableName, ...args);
    if (tableName !== "profiles") {
      return builder;
    }

    return new Proxy(builder, {
      get(target, prop, receiver) {
        if (prop === "update") {
          return (payload) => {
            if (shouldBlockProfileMutation(payload)) {
              return makeDeniedQuery(
                "Restricted profile fields cannot be changed by this user."
              );
            }
            const next = target.update.call(target, payload);
            return new Proxy(next, this);
          };
        }

        if (prop === "upsert") {
          return (payload, options) => {
            if (shouldBlockProfileMutation(payload)) {
              return makeDeniedQuery(
                "Restricted profile fields cannot be changed by this user."
              );
            }
            const next = target.upsert.call(target, payload, options);
            return new Proxy(next, this);
          };
        }

        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  };

  return client;
})();
