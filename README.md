# Sora Invite Code Script

A browser-based script for automatically testing invite codes on OpenAI's Sora platform.

## ⚠️ Disclaimer

**This script is provided for educational purposes only.** 

- Use this script at your own discretion and risk
- The author does not condone the use of this script for any purpose
- The author is not responsible for any consequences including, but not limited to, account bans, rate limiting, or IP blocks
- This may violate OpenAI's Terms of Service

**Use responsibly and understand the risks before proceeding.**

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Access to the Sora invite code dialog/modal
- Basic understanding of browser developer tools

## 🚀 Usage

1. Navigate to the Sora platform where the invite code prompt is displayed
2. Ensure the "Enter invite code" modal/dialog is visible on screen
3. Open browser Developer Tools:
   - **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
   - **macOS**: Press `Cmd + Option + I`
4. Navigate to the **Console** tab
5. Copy the entire script from `script.js`
6. Paste the script into the console
7. Press `Enter` to execute

The script will begin automatically testing random codes. Progress will be logged to the console.

### Stopping Execution

To stop the script at any time, type the following in the console:

```javascript
isRunning = false
```

## 🔧 Configuration

You can modify these variables at the top of the script to adjust behavior:

```javascript
const DELAY_MS = 1500;              // Delay between attempts (milliseconds)
const MAX_ATTEMPTS = 10000;         // Maximum number of attempts before stopping
const VALIDATION_TIMEOUT = 6000;    // Time to wait for server response (milliseconds)
```

## ⚡ Features

- Automatic random code generation (alphanumeric, 6 characters)
- React-compatible input handling
- Handles dialog re-renders and element updates
- Detects success/failure responses
- Professional console logging
- Graceful error handling

## 🚧 Known Limitations

### Region Lock Issues
- **Currently only works for US/Canada residents**
- OpenAI's region lock message can break the script execution
- Users outside supported regions may experience errors

### Code Generation
- All codes are randomly generated
- **No duplicate prevention** - the same code may be tested multiple times
- No pattern recognition or optimization
- With 36^6 (2,176,782,336) possible combinations, this approach is highly inefficient

### OpenAI Defenses
- OpenAI likely has rate limiting in place
- Multiple failed attempts may trigger IP-based throttling or bans
- CAPTCHA or additional verification may be implemented
- Your account or IP may be flagged for suspicious activity

## 💡 Potential Improvements

1. **Duplicate Prevention**: Implement a Set to track attempted codes
2. **Pattern Recognition**: Analyze known valid codes for patterns
3. **Smart Generation**: Use hints or leaked code formats if available
4. **Rate Limiting**: Add adaptive delays based on response times
5. **Region Detection**: Auto-detect region locks and pause execution
6. **Proxy Support**: Rotate IPs to avoid rate limiting (advanced)
7. **Multi-threading**: Test multiple codes simultaneously (if possible)
8. **Code Sharing**: Integrate with a database of known valid/invalid codes

## 🤝 Contributing

If you successfully obtain a valid invite code, consider sharing it with the community!

Feel free to submit pull requests with improvements, bug fixes, or feature additions.

## 📄 License

This project is provided as-is without any warranty. Use at your own risk.

---

