const asyncHandler = (requestHandler) => {
    console.log('AsyncHandler run');
    
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler };



// const asynchandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch {
//         (err) => {
//             res.status((err.code || 500)).json({
//                 success: false,
//                 message: err.message
//             })
//         }
//     }
// }