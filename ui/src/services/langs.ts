export type LanguageServicePrototype = {
  getAll(): ISOLanguage[];
  get(code: string): ISOLanguage | undefined;
};

export type ISOLanguage = {
  code: string;
  name: string;
  nativeName: string;
  additional?: string;
};

function languageService(): LanguageServicePrototype {
  const isoLangs: {
    [key: string]: {
      name: string;
      nativeName: string;
      additional?: string;
    };
  } = {
    af: { name: 'Afrikaans', nativeName: 'Afrikaans' },
    sq: { name: 'Albanian', nativeName: 'Shqip' },
    am: { name: 'Amharic', nativeName: 'አማርኛ' },
    ar: { name: 'Arabic', nativeName: 'العربية' },
    hy: { name: 'Armenian', nativeName: 'Հայերեն' },
    az: { name: 'Azerbaijani', nativeName: 'azərbaycan dili' },
    eu: { name: 'Basque', nativeName: 'euskara, euskera' },
    be: { name: 'Belarusian', nativeName: 'Беларуская' },
    bn: { name: 'Bengali', nativeName: 'বাংলা' },
    bs: { name: 'Bosnian', nativeName: 'bosanski jezik' },
    bg: { name: 'Bulgarian', nativeName: 'български език' },
    ca: { name: 'Catalan', nativeName: 'Català', additional: 'Valencian' },
    ny: {
      name: 'Chichewa',
      nativeName: 'chiCheŵa, chinyanja',
      additional: 'Chewa; Nyanja',
    },
    ch: {
      name: 'Chinese',
      nativeName: '中国 (Zhōngguó)',
    },
    co: { name: 'Corsican', nativeName: 'corsu, lingua corsa' },
    hr: { name: 'Croatian', nativeName: 'hrvatski' },
    cs: { name: 'Czech', nativeName: 'česky, čeština' },
    da: { name: 'Danish', nativeName: 'dansk' },
    nl: { name: 'Dutch', nativeName: 'Nederlands, Vlaams' },
    en: { name: 'English', nativeName: 'English' },
    eo: { name: 'Esperanto', nativeName: 'Esperanto' },
    et: { name: 'Estonian', nativeName: 'eesti, eesti keel' },
    fi: { name: 'Finnish', nativeName: 'suomi, suomen kieli' },
    fr: { name: 'French', nativeName: 'français, langue française' },
    gl: { name: 'Galician', nativeName: 'Galego' },
    ka: { name: 'Georgian', nativeName: 'ქართული' },
    de: { name: 'German', nativeName: 'Deutsch' },
    el: { name: 'Greek', nativeName: 'Ελληνικά' },
    gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
    ht: {
      name: 'Haitian',
      nativeName: 'Kreyòl ayisyen',
      additional: 'Haitian Creole',
    },
    ha: { name: 'Hausa', nativeName: 'Hausa, هَوُسَ' },
    he: { name: 'Hebrew', nativeName: 'עברית' },
    hi: { name: 'Hindi', nativeName: 'हिन्दी, हिंदी' },
    hu: { name: 'Hungarian', nativeName: 'Magyar' },
    id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    ga: { name: 'Irish', nativeName: 'Gaeilge' },
    is: { name: 'Icelandic', nativeName: 'Íslenska' },
    it: { name: 'Italian', nativeName: 'Italiano' },
    ja: { name: 'Japanese', nativeName: '日本語 (にほんご／にっぽんご)' },
    jv: { name: 'Javanese', nativeName: 'basa Jawa' },
    kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    kk: { name: 'Kazakh', nativeName: 'Қазақ тілі' },
    km: { name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
    rw: { name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
    ky: { name: 'Kirghiz', nativeName: 'кыргыз тили', additional: 'Kyrgyz' },
    ko: { name: 'Korean', nativeName: '한국어 (韓國語), 조선말 (朝鮮語)' },
    ku: { name: 'Kurdish', nativeName: 'Kurdî, كوردی‎' },
    lb: {
      name: 'Luxembourgish',
      nativeName: 'Lëtzebuergesch',
      additional: 'Letzeburgesch',
    },
    lo: { name: 'Lao', nativeName: 'ພາສາລາວ' },
    lt: { name: 'Lithuanian', nativeName: 'lietuvių kalba' },
    lv: { name: 'Latvian', nativeName: 'latviešu valoda' },
    mk: { name: 'Macedonian', nativeName: 'македонски јазик' },
    mg: { name: 'Malagasy', nativeName: 'Malagasy fiteny' },
    mt: { name: 'Maltese', nativeName: 'Malti' },
    mi: { name: 'Māori', nativeName: 'te reo Māori' },
    mr: { name: 'Marathi', nativeName: 'मराठी', additional: 'Marāṭhī' },
    mn: { name: 'Mongolian', nativeName: 'монгол' },
    ne: { name: 'Nepali', nativeName: 'नेपाली' },
    no: { name: 'Norwegian', nativeName: 'Norsk' },
    pa: {
      name: 'Panjabi',
      nativeName: 'ਪੰਜਾਬੀ, پنجابی‎',
      additional: 'Punjabi',
    },
    fa: { name: 'Persian', nativeName: 'فارسی' },
    pl: { name: 'Polish', nativeName: 'polski' },
    ps: { name: 'Pashto', nativeName: 'پښتو', additional: 'Pushto' },
    pt: { name: 'Portuguese', nativeName: 'Português' },
    ro: {
      name: 'Romanian',
      nativeName: 'română',
      additional: 'Moldavian, Moldovan',
    },
    ru: { name: 'Russian', nativeName: 'русский язык' },
    sm: { name: 'Samoan', nativeName: 'gagana faa Samoa' },
    sr: { name: 'Serbian', nativeName: 'српски језик' },
    gd: {
      name: 'Scottish Gaelic',
      nativeName: 'Gàidhlig',
      additional: 'Gaelic',
    },
    sn: { name: 'Shona', nativeName: 'chiShona' },
    si: { name: 'Sinhala', nativeName: 'සිංහල', additional: 'Sinhalese' },
    sk: { name: 'Slovak', nativeName: 'slovenčina' },
    sl: { name: 'Slovene', nativeName: 'slovenščina' },
    so: { name: 'Somali', nativeName: 'Soomaaliga, af Soomaali' },
    st: { name: 'Southern Sotho', nativeName: 'Sesotho' },
    es: {
      name: 'Spanish',
      nativeName: 'español, castellano',
      additional: 'Castilian',
    },
    su: { name: 'Sundanese', nativeName: 'Basa Sunda' },
    sw: { name: 'Swahili', nativeName: 'Kiswahili' },
    sv: { name: 'Swedish', nativeName: 'svenska' },
    ta: { name: 'Tamil', nativeName: 'தமிழ்' },
    te: { name: 'Telugu', nativeName: 'తెలుగు' },
    tg: { name: 'Tajik', nativeName: 'тоҷикӣ, toğikī, تاجیکی‎' },
    th: { name: 'Thai', nativeName: 'ไทย' },
    tk: { name: 'Turkmen', nativeName: 'Türkmen, Түркмен' },
    tl: { name: 'Tagalog', nativeName: 'Wikang Tagalog' },
    tr: { name: 'Turkish', nativeName: 'Türkçe' },
    ug: {
      name: 'Uighur',
      nativeName: 'Uyƣurqə, ئۇيغۇرچە‎',
      additional: 'Uyghur',
    },
    uk: { name: 'Ukrainian', nativeName: 'українська' },
    ur: { name: 'Urdu', nativeName: 'اردو' },
    uz: { name: 'Uzbek', nativeName: 'zbek, Ўзбек, أۇزبېك‎' },
    vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    cy: { name: 'Welsh', nativeName: 'Cymraeg' },
    xh: { name: 'Xhosa', nativeName: 'isiXhosa' },
    yi: { name: 'Yiddish', nativeName: 'ייִדיש' },
    yo: { name: 'Yoruba', nativeName: 'Yorùbá' },
  };

  return {
    getAll() {
      const output: ISOLanguage[] = [];
      for (const key in isoLangs) {
        const lang = isoLangs[key];
        output.push({
          code: key,
          name: lang.name,
          nativeName: lang.nativeName,
          additional: lang.additional,
        });
      }
      return output;
    },
    get(code) {
      const lang = isoLangs[code];
      if (lang) {
        return {
          code,
          name: lang.name,
          nativeName: lang.nativeName,
          additional: lang.additional,
        };
      }
    },
  };
}

export const LanguageService = languageService();
