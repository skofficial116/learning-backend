import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // console.log('File uploaded on Cloudinary!! at ' + response.url);
        // fs.unlinkSync(localFilePath)
        // console.log("Path:", path, "Type:", typeof path);

        return response;

    } catch (error) {
        // console.log('');
        // console.log('');
        // console.log('');
        // console.log('');
        console.log(error?.message);
        console.log('');
        console.log('');
        console.log('');
        console.log('');


        // fs.unlinkSync(localFilePath)
        return null;
    }
}

export { uploadOnCloudinary };