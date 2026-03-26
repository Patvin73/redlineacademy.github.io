# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - navigation "Language selector" [ref=e4]:
      - button "Bahasa Indonesia" [ref=e5] [cursor=pointer]:
        - img [ref=e6]
        - generic [ref=e7]: Bahasa Indonesia
      - button "English" [ref=e8] [cursor=pointer]:
        - img [ref=e9]
        - generic [ref=e10]: English
    - tablist "Pilih jenis login" [ref=e11]:
      - tab "Login LMS" [ref=e12] [cursor=pointer]:
        - generic [ref=e14]: Login LMS
      - tab "Marketer Portal" [selected] [ref=e15] [cursor=pointer]:
        - generic [ref=e17]: Marketer Portal
    - tabpanel "Marketer Portal" [ref=e18]:
      - heading "Marketer Portal Portal" [level=2] [ref=e19]:
        - text: Marketer Portal
        - generic [ref=e20]: Portal
      - paragraph [ref=e21]: Masuk ke portal komisi & manajemen pemasaran.
      - generic [ref=e22]:
        - generic [ref=e23]: Email
        - textbox "Email" [ref=e24]:
          - /placeholder: Email Anda
          - text: marketer@example.com
        - generic [ref=e25]: Password
        - textbox "Password" [ref=e26]:
          - /placeholder: Masukkan password Anda
          - text: "12345678"
        - button "Masuk ke Portal" [active] [ref=e27] [cursor=pointer]
      - paragraph [ref=e28]
    - link "Kembali ke website utama" [ref=e29] [cursor=pointer]:
      - /url: ../index.html
```