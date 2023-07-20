import { BoardMeta } from '../Board/Board';

export const dynamicNumberType = ["number", "variable", "meta"] as const;
export enum Equality {
    EQUALS = "=",
    LESS = "<",
    GREATER = ">",
    LESSEQUAL = "<=",
    GREATEREQUAL = ">=",
    NOT = "!"
}
export const variables: string[] = [
    "deez",
    "nuts"
]

export type DynamicNumberType = typeof dynamicNumberType[number];
export interface DynamicNumber {
    numberType: DynamicNumberType,
    value: number | string | keyof BoardMeta
}
export const commandType = ["", "if", "when", "function", "setVariable", "addVariable", "loseGame", "winGame", "wait"] as const;
export type CommandType = typeof commandType[number];

type ArgumentType = "dynamicNumber" | "equality" | "command" | "variable" | "plainText";
export interface Argument {
    type: ArgumentType;
    value: DynamicNumber | Equality | Command | string;
}

export interface Command {
    type: CommandType;
    args: Argument[];
}

export interface Script {
    functions: Command[][];
    variables: string[];
}

export const argDefault: Record<string, (str?: string) => Argument> = {
    dynamicNumber: () => ({ type: "dynamicNumber", value: { numberType: "number", value: 0 } }),
    equality: () => ({ type: "equality", value: Equality.EQUALS }),
    command: () => ({ type: "command", value: { type: "", args: [] } }),
    variable: () => ({ type: "variable", value: variables[0] }),
    plainText: (str) => ({ type: "plainText", value: str ?? "" })
}

export function getNewArgs(commandType: CommandType): Argument[] {
    const { dynamicNumber, equality, command, variable, plainText } = argDefault;
    switch (commandType) {
        case "if":
        case "when":
            return [dynamicNumber(), equality(), dynamicNumber(), { type: "plainText", value: "run" }, command()];
        case "function":
            return [dynamicNumber()];
        case "addVariable":
            return [variable(), plainText("by"), dynamicNumber()];
        case "setVariable":
            return [variable(), plainText("to"), dynamicNumber()];
        case "wait":
            return [dynamicNumber(), plainText("seconds")]
        case "loseGame":
        case "winGame":
        case "":
        default:
            return [];
    }
}