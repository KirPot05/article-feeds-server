export function failed_response(code, message, response = {}){
    return {
        code,
        message,
        response,
        success: false 
    }
}

export function success_response(code, message, response = {}){
    return {
        code: code,
        message: message,
        response: response,
        success: true 
    }
}