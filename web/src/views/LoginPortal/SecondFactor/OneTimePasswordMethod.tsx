import React, { useCallback, useEffect, useRef, useState } from "react";

import { useRedirectionURL } from "@hooks/RedirectionURL";
import { useUserInfoTOTPConfiguration } from "@hooks/UserInfoTOTPConfiguration";
import { completeTOTPSignIn } from "@services/OneTimePassword";
import { AuthenticationLevel } from "@services/State";
import LoadingPage from "@views/LoadingPage/LoadingPage";
import MethodContainer, { State as MethodContainerState } from "@views/LoginPortal/SecondFactor/MethodContainer";
import OTPDial from "@views/LoginPortal/SecondFactor/OTPDial";

export enum State {
    Idle = 1,
    InProgress = 2,
    Success = 3,
    Failure = 4,
}

export interface Props {
    id: string;
    authenticationLevel: AuthenticationLevel;
    registered: boolean;

    onRegisterClick: () => void;
    onSignInError: (err: Error) => void;
    onSignInSuccess: (redirectURL: string | undefined) => void;
}

const OneTimePasswordMethod = function (props: Props) {
    const [passcode, setPasscode] = useState("");
    const [state, setState] = useState(
        props.authenticationLevel === AuthenticationLevel.TwoFactor ? State.Success : State.Idle,
    );
    const redirectionURL = useRedirectionURL();

    const { onSignInSuccess, onSignInError } = props;
    const onSignInErrorCallback = useRef(onSignInError).current;
    const onSignInSuccessCallback = useRef(onSignInSuccess).current;

    const [resp, fetch, , err] = useUserInfoTOTPConfiguration();

    useEffect(() => {
        if (err) {
            console.error(err);
            onSignInErrorCallback(new Error("Could not obtain user settings"));
            setState(State.Failure);
        }
    }, [onSignInErrorCallback, err]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const signInFunc = useCallback(async () => {
        if (!props.registered || props.authenticationLevel === AuthenticationLevel.TwoFactor) {
            return;
        }

        const passcodeStr = `${passcode}`;

        if (!passcode || passcodeStr.length !== (resp?.digits || 6)) {
            return;
        }

        try {
            setState(State.InProgress);
            const res = await completeTOTPSignIn(passcodeStr, redirectionURL);
            setState(State.Success);
            onSignInSuccessCallback(res ? res.redirect : undefined);
        } catch (err) {
            console.error(err);
            onSignInErrorCallback(new Error("The one-time password might be wrong"));
            setState(State.Failure);
        }
        setPasscode("");
    }, [
        onSignInErrorCallback,
        onSignInSuccessCallback,
        passcode,
        redirectionURL,
        resp,
        props.authenticationLevel,
        props.registered,
    ]);

    // Set successful state if user is already authenticated.
    useEffect(() => {
        if (props.authenticationLevel >= AuthenticationLevel.TwoFactor) {
            setState(State.Success);
        }
    }, [props.authenticationLevel, setState]);

    useEffect(() => {
        signInFunc();
    }, [signInFunc]);

    let methodState = MethodContainerState.METHOD;
    if (props.authenticationLevel === AuthenticationLevel.TwoFactor) {
        methodState = MethodContainerState.ALREADY_AUTHENTICATED;
    } else if (!props.registered) {
        methodState = MethodContainerState.NOT_REGISTERED;
    }

    return (
        <MethodContainer
            id={props.id}
            title="One-Time Password"
            explanation="Enter one-time password"
            duoSelfEnrollment={false}
            registered={props.registered}
            state={methodState}
            onRegisterClick={props.onRegisterClick}
        >
            <div>
                {resp !== undefined || err !== undefined ? (
                    <OTPDial
                        passcode={passcode}
                        period={resp?.period || 30}
                        digits={resp?.digits || 6}
                        onChange={setPasscode}
                        state={state}
                    />
                ) : (
                    <LoadingPage />
                )}
            </div>
        </MethodContainer>
    );
};

export default OneTimePasswordMethod;
