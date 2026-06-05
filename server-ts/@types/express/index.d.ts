import {
    GoogleProfileInfo,
    FoundResponse,
    RefreshTokenResponse,
    DeviceInfo
} from "../../helpers/interfaces";
import { IncomingHttpHeaders } from "http";


declare global {
    namespace Express {
        interface User {
            _json: GoogleProfileInfo
        }
        interface Request {
            result: FoundResponse,
            ACCOUNT: {
                id: string;
            }
        }
        interface Response {
            user: {
                _id: string;
                error: boolean;
            }
        }
    }
}

declare module "http" {
    interface IncomingHttpHeaders {
        "device-info": string | null
    }
}


export {}