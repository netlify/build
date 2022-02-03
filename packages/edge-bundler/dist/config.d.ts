interface ConfigEntryWithPath {
    handler: string;
    path: string;
}
interface ConfigEntryWithPathExpression {
    handler: string;
    pathExpression: string;
}
declare type ConfigEntry = ConfigEntryWithPath | ConfigEntryWithPathExpression;
export { ConfigEntry };
