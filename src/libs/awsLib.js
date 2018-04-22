import {
    CognitoUserPool
} from "amazon-cognito-identity-js";
import config from "../config";
import {
    Storage
} from "aws-amplify";

export async function s3Upload(file) {
    const filename = `${Date.now()}-${file.name}`;

    const stored = await Storage.vault.put(filename, file, {
        contentType: file.type
    });

    return stored.key;
}
export async function authUser() {
    const currentUser = getCurrentUser();

    if (currentUser === null) {
        return false;
    }

    await getUserToken(currentUser);

    return true;
}

function getUserToken(currentUser) {
    return new Promise((resolve, reject) => {
        currentUser.getSession(function (err, session) {
            if (err) {
                reject(err);


                return;
            }
            resolve(session.getIdToken().getJwtToken());
        });
    });
}

function getCurrentUser() {
    const userPool = new CognitoUserPool({
        UserPoolId: config.cognito.USER_POOL_ID,
        ClientId: config.cognito.APP_CLIENT_ID
    });
    return userPool.getCurrentUser();
}

export function signOutUser() {
    const currentUser = getCurrentUser();

    if (currentUser !== null) {
        currentUser.signOut();
    }
}