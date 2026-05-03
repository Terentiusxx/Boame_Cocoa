


# import cloudinary
# import cloudinary.uploader
# from fastapi import UploadFile
# from app.settings import settings

# cloudinary.config(
#     cloud_name=settings.CLOUDINARY_CLOUD_NAME,
#     api_key=settings.CLOUDINARY_API_KEY,
#     api_secret=settings.CLOUDINARY_API_SECRET
# )

# # For profile images — takes UploadFile, used in user/admin/expert routes
# async def upload_image(file: UploadFile, folder: str = "boa_mi_cocoa/users") -> str:
#     try:
#         print("Uploading file:", file.filename)
#         contents = await file.read()
#         result = cloudinary.uploader.upload(
#             contents,
#             folder=folder,
#             resource_type="image"
#         )
#         image_url = result.get("secure_url")
#         if not image_url:
#             raise Exception("Cloudinary did not return URL")
#         print("Cloudinary URL:", image_url)
#         return image_url
#     except Exception as e:
#         print("Cloudinary Error:", str(e))
#         raise e

# # For scan/voice routes — takes raw bytes, used in ai.py and scan.py
# def upload_bytes_to_cloudinary(contents: bytes, folder: str = "boa_mi_cocoa", resource_type: str = "image") -> str:
#     result = cloudinary.uploader.upload(
#         contents,
#         folder=folder,
#         resource_type=resource_type
#     )
#     image_url = result.get("secure_url")
#     if not image_url:
#         raise Exception("Cloudinary did not return URL")
#     print("Cloudinary URL:", image_url)
#     return image_url




import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from app.settings import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


async def upload_image(file: UploadFile, folder: str):
    contents = await file.read()

    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        resource_type="image"
    )

    return result.get("secure_url")


def upload_bytes_to_cloudinary(contents: bytes, folder: str):
    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        resource_type="image"
    )

    return result.get("secure_url")