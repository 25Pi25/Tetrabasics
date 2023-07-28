import Cookies from 'universal-cookie'

export interface ConfigOptions {
    das: number
    arr: number
    sdf: number
    controls: ConfigControls
}

export interface ConfigControls {
    left: string
    right: string
    hardDrop: string
    softDrop: string
    rotateCW: string
    rotateCCW: string
    hold: string
    flip: string
    reset: string
}

export default class Config {
    static config: ConfigOptions;
    static cookies = new Cookies();

    static createConfig() {
        const config: ConfigOptions = Config.cookies.get<ConfigOptions>("config") ?? { controls: {} };
        Config.config = {
            das: config.das ?? 167,
            arr: config.arr ?? 33,
            sdf: config.sdf ?? -1,
            controls: {
                left: config.controls?.left ?? "ArrowLeft",
                right: config.controls?.right ?? "ArrowRight",
                hardDrop: config.controls?.hardDrop ?? " ",
                softDrop: config.controls?.softDrop ?? "ArrowDown",
                rotateCW: config.controls?.rotateCW ?? "x",
                rotateCCW: config.controls?.rotateCCW ?? "z",
                hold: config.controls?.hold ?? "c",
                flip: config.controls?.flip ?? "a",
                reset: config.controls?.reset ?? "r"
            }
        }
    }
}