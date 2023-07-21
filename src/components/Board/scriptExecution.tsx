import { Argument, Command, DynamicNumber, Equality, Operation, Operator, getNewArgs } from '../ScriptEditor/scriptTypes';
import { Board, BoardMeta } from './Board';

export async function startScriptExecution(this: Board) {
    const { functions } = this.script;
    if (!functions[0]) {
        this.finishedScript = true;
        return;
    }
    void await this.executeFunction(functions[0]);
    this.finishedScript = true;
}

export async function executeFunction(this: Board, commands: Command[]) {
    for (const command of commands) {
        void await this.executeCommand(command)
        if (this.finishScriptEarly) return;
    }
}

export async function executeCommand(this: Board, { type, args }: Command) {
    if (this.finishScriptEarly) return;
    const { variables, functions } = this.script;
    const argTypes = getNewArgs(type).map(({ type }) => type)
    if (args.some(({ type }, i) => type != argTypes[i])) return;
    switch (type) {
        case "if":
            if (this.calculateCondition(args))
                await this.executeCommand(args[3].value as Command)
            return;
        case "when":
            this.whenConditions.push(args)
            if (this.whenConditions.length == 1) requestAnimationFrame(this.checkWhenConditions.bind(this));
            return;
        case "wait":
            await new Promise<void>(res => {
                setTimeout(res, variables[args[0].value as string]);
                setInterval(() => {
                    if (this.finishScriptEarly) res();
                }, 100)
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
            variables[args[0].value as string] = this.getDynamicNumber(args[1].value as DynamicNumber);
            return;
        case "addVariable":
            variables[args[0].value as string] += this.getDynamicNumber(args[1].value as DynamicNumber);
            return;
        case "setMap":
            this.setMap(args[0].value as string);
            return;
        case "":
        default:
            break;
    }
    if (type == "function") {
        const firstFunction = functions[this.getDynamicNumber(args[0].value as DynamicNumber)] ?? functions[0];
        requestAnimationFrame(() => void this.executeFunction.bind(this, firstFunction));
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
    switch (args[1].value as Equality) {
        case Equality.EQUALS:
            return var1 == var2;
        case Equality.GREATER:
            return var1 > var2;
        case Equality.GREATEREQUAL:
            return var1 >= var2;
        case Equality.LESS:
            return var1 < var2;
        case Equality.LESSEQUAL:
            return var1 <= var2;
        case Equality.NOT:
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