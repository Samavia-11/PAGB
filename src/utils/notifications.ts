import { toast } from '@/components/Toast';

// Enhanced alert function that uses toast notifications
export const showNotification = {
  success: (message: string) => {
    const parts = message.split('\n\n');
    const title = parts[0].replace(/^[🎉✅💾📧]+\s*/, ''); // Remove emojis from title
    const description = parts[1] || '';
    toast.success(title, description);
  },
  
  error: (message: string) => {
    const parts = message.split('\n\n');
    const title = parts[0].replace(/^[❌⚠️🔐📝📋📄]+\s*/, ''); // Remove emojis from title
    const description = parts[1] || '';
    toast.error(title, description);
  },
  
  warning: (message: string) => {
    const parts = message.split('\n\n');
    const title = parts[0].replace(/^[⚠️🔐📝📋📄]+\s*/, ''); // Remove emojis from title
    const description = parts[1] || '';
    toast.warning(title, description);
  },
  
  info: (message: string) => {
    const parts = message.split('\n\n');
    const title = parts[0].replace(/^[ℹ️📧💾]+\s*/, ''); // Remove emojis from title
    const description = parts[1] || '';
    toast.info(title, description);
  }
};

// Enhanced alert replacement that automatically detects message type
export const enhancedAlert = (message: string) => {
  // Detect message type based on emojis or keywords
  if (message.includes('🎉') || message.includes('✅') || message.includes('💾') || 
      message.includes('Successfully') || message.includes('Success')) {
    showNotification.success(message);
  } else if (message.includes('❌') || message.includes('Failed') || message.includes('Error')) {
    showNotification.error(message);
  } else if (message.includes('⚠️') || message.includes('Warning') || message.includes('Required')) {
    showNotification.warning(message);
  } else if (message.includes('📧') || message.includes('ℹ️') || message.includes('Info')) {
    showNotification.info(message);
  } else {
    // Default to info for unknown types
    showNotification.info(message);
  }
};

// Override global alert function (optional)
export const replaceGlobalAlert = () => {
  if (typeof window !== 'undefined') {
    window.alert = enhancedAlert;
  }
};
