# # app/settings.py

# from pydantic_settings import BaseSettings
# from pydantic import Field, field_validator

# class Settings(BaseSettings):
#     # -------------------
#     # App info
#     # -------------------
#     APP_NAME: str = "Boa Mi Cocoa API"
#     API_VERSION: str = "1.0.0"
#     DEBUG: bool = True

#     # -------------------
#     # Security
#     # -------------------
#     SECRET_KEY: str = Field(..., env="SECRET_KEY")  # must be in .env
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

#     # -------------------
#     # Database
#     # -------------------
#     DB_USER: str = Field(..., env="DB_USER")
#     DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
#     DB_HOST: str = Field(default="localhost")
#     DB_PORT: str = Field(default="5432")
#     DB_NAME: str = Field(..., env="DB_NAME")
#     DATABASE_URL: str | None = None

#     # -------------------
#     # CORS
#     # -------------------
#     BACKEND_CORS_ORIGINS: list[str] = ["*"]

#     # -------------------
#     # Auto-generate DATABASE_URL if not provided
#     # -------------------
#     @field_validator("DATABASE_URL", mode="before")
#     def assemble_db_url(cls, v, info):
#         if v is not None:
#             return v
#         return (
#             f"postgresql+psycopg2://{info.data['DB_USER']}:{info.data['DB_PASSWORD']}"
#             f"@{info.data.get('DB_HOST', 'localhost')}:{info.data.get('DB_PORT', '5432')}"
#             f"/{info.data['DB_NAME']}"
#         )

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"

# # Single instance
# settings = Settings()




from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    # -------------------
    # App info
    # -------------------
    APP_NAME: str = "Boa Mi Cocoa API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # -------------------
    # Security
    # -------------------
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # -------------------
    # Database
    # -------------------
    DB_USER: str = Field(..., env="DB_USER")
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    DB_HOST: str = Field(default="localhost")
    DB_PORT: str = Field(default="5432")
    DB_NAME: str = Field(..., env="DB_NAME")
    DATABASE_URL: str | None = None

    # -------------------
    # Cloudinary (FIX ADDED)
    # -------------------
    CLOUDINARY_CLOUD_NAME: str = Field(..., env="CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str = Field(..., env="CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str = Field(..., env="CLOUDINARY_API_SECRET")

    # -------------------
    # CORS
    # -------------------
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    # -------------------
    # Auto-generate DATABASE_URL if not provided
    # -------------------
    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_url(cls, v, info):
        if v is not None:
            return v

        return (
            f"postgresql+psycopg2://{info.data['DB_USER']}:{info.data['DB_PASSWORD']}"
            f"@{info.data.get('DB_HOST', 'localhost')}:{info.data.get('DB_PORT', '5432')}"
            f"/{info.data['DB_NAME']}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"   # ✅ IMPORTANT FIX (prevents Cloudinary env crash)


# Single instance
settings = Settings()