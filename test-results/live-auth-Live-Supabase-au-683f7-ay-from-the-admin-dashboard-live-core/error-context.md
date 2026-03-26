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
      - tab "Login LMS" [selected] [ref=e12] [cursor=pointer]:
        - generic [ref=e14]: Login LMS
      - tab "Marketer Portal" [ref=e15] [cursor=pointer]:
        - generic [ref=e17]: Marketer Portal
    - tabpanel "Login LMS" [ref=e18]:
      - heading "Login LMS" [level=1] [ref=e19]
      - paragraph [ref=e20]: Masuk dengan akun resmi Redline Academy.
      - generic [ref=e21]:
        - generic [ref=e22]: Email
        - textbox "Email" [ref=e23]:
          - /placeholder: Email Anda
          - text: student.mn7akkkxhdg7bz@example.com
        - generic [ref=e24]: Password
        - textbox "Password" [ref=e25]:
          - /placeholder: Masukkan password Anda
          - text: "12345678"
        - button "Masuk" [active] [ref=e26] [cursor=pointer]
      - paragraph [ref=e27]
    - link "Kembali ke website utama" [ref=e28] [cursor=pointer]:
      - /url: ../index.html
```