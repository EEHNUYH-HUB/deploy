
import crypto from 'crypto'
const algorithm = 'aes-256-cbc';
// 전역 변수로 ICryptoKey를 선언
let cryptoKey: ICryptoKey;
// ICryptoKey를 초기화하는 함수
export const InitializeCryptoKey = (keyProvider: ICryptoKey): void => {
    cryptoKey = keyProvider;
};

export interface ICryptoKey {
    GetKey: () => string;
}

export const Encrypt = (text: string) => {

    if (text) {
        var chkDecrypt = Decrypt(text)
        if (chkDecrypt !== text) {
            //암호화가 안된 text일경우 복호화가 안되어 chkDecrypt값과 text 값이 같다
            //만약 다른값으로 나온다는말은 text값이 암호화된 값이라는 뜻으로 암호화를 진행
            //안하고 text값을 리턴해준다

            
            return text;
        }
        
        
        var iv = crypto.randomBytes(16);
        var originalKey = cryptoKey ? cryptoKey.GetKey() : "FlowLine12#$"
        var key = crypto.createHash('sha256').update(originalKey).digest(); // 32바이트 키 생성

        var cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`; // Use ':' as a separator

    }
    else {
        return text;
    }

}
export const Decrypt = (encryptedData: string) => {
    if (encryptedData) {
        try {

            var parts = encryptedData.split(':');
            if (parts && parts.length === 2) {
                var ivTxt = parts[0];
                var iv = Buffer.from(ivTxt, 'hex'); // Extract the IV
                var encryptedTextWithoutIV = parts[1]; // Join the rest
                var originalKey = cryptoKey ? cryptoKey.GetKey() : "FlowLine12#$"
                var key = crypto.createHash('sha256').update(originalKey).digest(); // 32바이트 키 생성
        
                var decipher = crypto.createDecipheriv(algorithm, key , iv);
                let decrypted = decipher.update(encryptedTextWithoutIV, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted
            }
        }
        catch {

        }
    }

    return encryptedData;
    
}