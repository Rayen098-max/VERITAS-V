# Windows PowerShell File Encoding

## Constraints
1. **Never use `echo` redirection**: When working in Windows PowerShell, never use bash-style output redirection like `echo "text" >> filename` or `echo "text" > filename` to create or append to text files (e.g., `.gitignore`, `.env`, or code files). PowerShell's native `echo` defaults to UTF-16/UCS-2 encoding, which inserts null bytes and corrupts cross-platform text files, causing errors in tools like `git`.
2. **Correct Methods**: To edit files on Windows, exclusively use your built-in code edit/write tools (like `replace_file_content` or `write_to_file`), dedicated Python scripts, or explicitly enforce UTF-8 encoding in PowerShell (e.g., `Out-File -Encoding utf8`).
