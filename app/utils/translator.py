from app.utils.language_config import DEFAULT_LANGUAGE, TRANSLATIONS


def translate(text: str, lang: str =   DEFAULT_LANGUAGE):

    if lang == DEFAULT_LANGUAGE:
        return text
    
    if text in TRANSLATIONS:
        return TRANSLATIONS[text].get(lang, text)
    
    return text