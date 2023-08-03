import { Argument, Command, DynamicNumber, Equality, Operation, Operator, getNewArgs } from '../ScriptEditor/scriptTypes';
import { Board, BoardMeta } from './Board';
import { PauseType } from './controls';

export async function startScriptExecution(this: Board) {
    const { functions } = this.script;
    if (!functions[0]) {
        return;
    }
    void await this.executeFunction(functions[0]);
}

export async function executeFunction(this: Board, commands: Command[]) {
    for (const command of commands) {
        void await this.executeCommand(command)
    }
}

export async function executeCommand(this: Board, { type, args }: Command) {
    const { variables, functions } = this.script;
    const argTypes = getNewArgs(type).map(({ type }) => type)
    if (args.some(({ type }, i) => type != argTypes[i])) return;
    if (this.paused == PauseType.GAMEOVER) return;
    switch (type) {
        case "if":
            if (this.calculateCondition(args))
                await this.executeCommand(args[4].value as Command)
            return;
        case "when":
            this.whenConditions.push(args)
            if (this.whenConditions.length == 1) requestAnimationFrame(this.checkWhenConditions.bind(this));
            return;
        case "wait":
            await new Promise<void>(res => {
                setTimeout(res, this.getDynamicNumber(args[0].value as DynamicNumber) * 1000);
            });
            return;
        case "winGame":
            void this.gameOver(true);
            console.log("you win!")
            return;
        case "loseGame":
            void this.gameOver();
            console.log("you LOSE LOSER FUCK YOU!!!!!")
            return;
        case "setVariable":
            variables[args[0].value as string] = this.getDynamicNumber(args[2].value as DynamicNumber);
            return;
        case "addVariable":
            variables[args[0].value as string] += this.getDynamicNumber(args[2].value as DynamicNumber);
            return;
        case "setMap":
            this.setMap(args[0].value as string);
            return;
        case "injectGarbage":
            this.injectGarbage(this.getDynamicNumber(args[0].value as DynamicNumber));
            return;
        case "setDisplay":
            this.display = (args[0].value as string)
                .replace(/\{(\w+)\}/g, (_, propName: string) => (this.script.variables[propName] || 0).toString());
            this.redraw();
            break;
        case "":
        default:
            break;
    }
    if (type == "function") {
        const firstFunction = functions[this.getDynamicNumber(args[0].value as DynamicNumber)] ?? functions[0];
        await this.executeFunction(firstFunction);
    }
    if (type == "asyncFunction") {
        const firstFunction = functions[this.getDynamicNumber(args[0].value as DynamicNumber)] ?? functions[0];
        requestAnimationFrame(() => void this.executeFunction(firstFunction));
    }
}

export function checkWhenConditions(this: Board) {
    for (const whenCondition of this.whenConditions) {
        if (!this.calculateCondition(whenCondition)) continue;
        void this.executeCommand(whenCondition[4].value as Command);
        this.whenConditions = this.whenConditions.filter(x => x != whenCondition);
    }
    if (this.whenConditions.length) requestAnimationFrame(this.checkWhenConditions.bind(this));
}

export function getVariable(this: Board, variable: string) {
    return this.script.variables[variable];
}

export function calculateCondition(this: Board, args: Argument[]) {
    const [var1, var2] = [args[0], args[2]].map(arg => {
        const dynamicNumber = arg.value as DynamicNumber;
        return this.getDynamicNumber(dynamicNumber);
    });
    const { EQUALS, GREATER, GREATEREQUAL, LESS, LESSEQUAL, NOT } = Equality;
    switch (args[1].value as Equality) {
        case EQUALS:
            return var1 == var2;
        case GREATER:
            return var1 > var2;
        case GREATEREQUAL:
            return var1 >= var2;
        case LESS:
            return var1 < var2;
        case LESSEQUAL:
            return var1 <= var2;
        case NOT:
            return var1 != var2;
    }
}

export function getDynamicNumber(this: Board, { numberType, value }: DynamicNumber): number {
    switch (numberType) {
        case "number":
            return value as number ?? 0;
        case "variable":
            return this.script.variables[value as string] ?? 0;
        case "meta":
            return this.meta[value as keyof BoardMeta] ?? 0;
    }
    if (numberType == "operation") {
        const operation = value as Operation;
        const number1 = this.getDynamicNumber(operation.number1) ?? 0;
        const number2 = this.getDynamicNumber(operation.number2) ?? 0;
        switch (operation.operation) {
            case Operator.PLUS:
                return number1 + number2;
            case Operator.MINUS:
                return number1 - number2;
            case Operator.MULTIPLY:
                return number1 * number2;
            case Operator.DIVIDE:
                return number1 / number2;
            case Operator.MODULO:
                return number1 % number2;
        }
    }
    return 0;
}