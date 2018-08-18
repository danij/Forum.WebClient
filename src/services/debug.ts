export module Debug {

    interface DebugConfig {

        enableAllPrivileges: boolean
    }

    declare const debugConfig: DebugConfig;

    export function enableAllPrivileges() : boolean {

        return debugConfig.enableAllPrivileges;
    }
}