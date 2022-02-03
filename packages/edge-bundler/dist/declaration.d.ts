interface DeclarationWithPath {
    handler: string;
    path: string;
}
interface DeclarationWithPattern {
    handler: string;
    pattern: string;
}
declare type Declaration = DeclarationWithPath | DeclarationWithPattern;
export { Declaration, DeclarationWithPath, DeclarationWithPattern };
