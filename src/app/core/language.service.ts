import { Injectable } from '@angular/core';

interface TranslationKeys {
  [key: string]: string;
}

interface Translations {
  [language: string]: TranslationKeys;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = 'en';
  
  private translations: Translations = {
    en: {
      'aptitude_arena': 'APTITUDE ARENA',
      'dashboard': 'Dashboard',
      'quiz': 'Quiz',
      'leaderboard': 'Leaderboard',
      'settings': 'Settings',
      'profile': 'Profile',
      'logout': 'Logout',
      'create_room': 'Create Room',
      'join_room': 'Join Room',
      'start_quiz': 'Start Quiz',
      'submit_answer': 'Submit Answer',
      'next_question': 'Next Question',
      'final_score': 'Final Score',
      'play_again': 'Play Again',
      'save_settings': 'Save Settings',
      'reset_defaults': 'Reset to Defaults',
      'theme': 'Theme',
      'language': 'Language',
      'notifications': 'Notifications',
      'sound_effects': 'Sound Effects',
      'auto_start': 'Auto Start',
      'default_time_limit': 'Default Time Limit',
      'default_questions': 'Default Questions',
      'default_domain': 'Default Domain',
      'dark_theme': 'Dark Theme',
      'light_theme': 'Light Theme',
      'neon_theme': 'Neon Theme',
      'english': 'English',
      'hindi': 'हिन्दी (Hindi)',
      'mixed': 'Mixed',
      'verbal': 'Verbal',
      'logical': 'Logical',
      'quantitative': 'Quantitative',
      'loading': 'Loading...',
      'saving': 'Saving...',
      'settings_saved': 'Settings saved successfully!',
      'settings_failed': 'Failed to save settings',
      'back_to_dashboard': 'Back to Dashboard'
    },
    hi: {
      'aptitude_arena': 'योग्यता क्षेत्र',
      'dashboard': 'डैशबोर्ड',
      'quiz': 'प्रश्नोत्तरी',
      'leaderboard': 'लीडरबोर्ड',
      'settings': 'सेटिंग्स',
      'profile': 'प्रोफ़ाइल',
      'logout': 'लॉग आउट',
      'create_room': 'कमरा बनाएं',
      'join_room': 'कमरे में शामिल हों',
      'start_quiz': 'प्रश्नोत्तरी शुरू करें',
      'submit_answer': 'उत्तर जमा करें',
      'next_question': 'अगला प्रश्न',
      'final_score': 'अंतिम स्कोर',
      'play_again': 'फिर से खेलें',
      'save_settings': 'सेटिंग्स सेव करें',
      'reset_defaults': 'डिफ़ॉल्ट पर रीसेट करें',
      'theme': 'थीम',
      'language': 'भाषा',
      'notifications': 'सूचनाएं',
      'sound_effects': 'ध्वनि प्रभाव',
      'auto_start': 'स्वचालित शुरुआत',
      'default_time_limit': 'डिफ़ॉल्ट समय सीमा',
      'default_questions': 'डिफ़ॉल्ट प्रश्न',
      'default_domain': 'डिफ़ॉल्ट डोमेन',
      'dark_theme': 'डार्क थीम',
      'light_theme': 'लाइट थीम',
      'neon_theme': 'नियॉन थीम',
      'english': 'English',
      'hindi': 'हिन्दी (Hindi)',
      'mixed': 'मिश्रित',
      'verbal': 'मौखिक',
      'logical': 'तार्किक',
      'quantitative': 'मात्रात्मक',
      'loading': 'लोड हो रहा है...',
      'saving': 'सेव हो रहा है...',
      'settings_saved': 'सेटिंग्स सफलतापूर्वक सेव हो गईं!',
      'settings_failed': 'सेटिंग्स सेव करने में विफल',
      'back_to_dashboard': 'डैशबोर्ड पर वापस जाएं'
    }
  };

  constructor() {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.setLanguage(savedLanguage);
  }

  setLanguage(language: string) {
    // Validate language is supported
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      this.applyLanguage();
    } else {
      console.warn(`Language '${language}' is not supported. Using English.`);
      this.currentLanguage = 'en';
      localStorage.setItem('language', 'en');
      this.applyLanguage();
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  translate(key: string): string {
    const currentLangTranslations = this.translations[this.currentLanguage];
    const englishTranslations = this.translations['en'];
    
    return currentLangTranslations?.[key] || englishTranslations?.[key] || key;
  }

  private applyLanguage() {
    document.documentElement.setAttribute('lang', this.currentLanguage);
    
    // Apply RTL for Hindi if needed
    if (this.currentLanguage === 'hi') {
      document.documentElement.setAttribute('dir', 'ltr'); // Hindi uses LTR
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }
}
