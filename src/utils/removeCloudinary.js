import { cloudinaryInstance } from "../config/cloudinary.config.js";


const deleteImage = async (userEmail) => {
    try {
        if(!userEmail) {
            throw new Error('Cannot get the public key');
        }
        const response = await cloudinaryInstance.uploader.destroy(userEmail)
        return response
    } catch (error) {
       throw new Error(error.message)
    }
}

export default deleteImage