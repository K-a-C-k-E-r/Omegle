const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<object>} Upload result
 */
async function uploadImage(base64Image, folder = 'omegle-chats') {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
            ]
        })

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<object>} Delete result
 */
async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        return {
            success: true,
            result
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

module.exports = {
    uploadImage,
    deleteImage,
    cloudinary
}
