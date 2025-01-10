module.exports = class ResponseDispatcher {
    constructor(){
        this.key = "responseDispatcher";
    }
    dispatch(res, {ok, data, code, errors, message, msg}){
        if (res.headersSent) {
            console.warn('Attempted to send response after headers were already sent');
            return;
        }

        let statusCode = code? code: (ok==true)?200:400;
        return res.status(statusCode).send({
            ok: ok || false,
            data: data || {},
            errors: errors || [],
            message: msg || message ||'',
        });
    }
}