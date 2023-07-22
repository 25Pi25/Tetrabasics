import { BoardMeta } from '../Board/Board';

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

export const dynamicNumberType = ["number", "variable", "meta", "operation"] as const;
export type DynamicNumberType = typeof dynamicNumberType[number];
export interface DynamicNumber {
    numberType: DynamicNumberType,
    value: number | string | keyof BoardMeta | Operation
}
export enum Operator {
    PLUS = "+",
    MINUS = "-",
    MULTIPLY = "*",
    DIVIDE = "/",
    MODULO = "%"
}
export interface Operation {
    number1: DynamicNumber,
    operation: Operator,
    number2: DynamicNumber
}

export const commandType = [
    "",
    "if",
    "when",
    "function",
    "setVariable",
    "addVariable",
    "loseGame",
    "winGame",
    "wait",
    "setMap",
    "injectGarbage",
    "asyncFunction",
    "setDisplay"
] as const;
export type CommandType = typeof commandType[number];

type ArgumentType = "dynamicNumber" | "equality" | "command" | "variable" | "plainText" | "string";
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
    plainText: (value = "") => ({ type: "plainText", value }),
    string: () => ({ type: "string", value: "" })
}

export function getNewArgs(commandType: CommandType): Argument[] {
    const { dynamicNumber, equality, command, variable, plainText, string } = argDefault;
    switch (commandType) {
        case "if":
        case "when":
            return [dynamicNumber(), equality(), dynamicNumber(), plainText("run"), command()];
        case "function":
        case "asyncFunction":
        case "injectGarbage":
            return [dynamicNumber()];
        case "addVariable":
            return [variable(), plainText("by"), dynamicNumber()];
        case "setVariable":
            return [variable(), plainText("to"), dynamicNumber()];
        case "wait":
            return [dynamicNumber(), plainText("seconds")];
        case "setMap":
        case "setDisplay":
            return [string()];
        case "loseGame":
        case "winGame":
        case "":
        default:
            return [];
    }
}