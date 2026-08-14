// 这里包含所有插件导出的函数及变量声明，声明的函数会在类型标注中标注到core上

interface PluginDeclaration {
    /**
     * 添加函数  例：添加弹出文字，像这个就可以使用core.addPop或core.plugin.addPop调用
     * @param px 弹出的横坐标
     * @param py 弹出的纵坐标
     * @param value 弹出的文字
     */
    addPop(px: number, py: number, value: string): void;

    /**
     * 添加变量  例：所有的正在弹出的文字，像这个就可以使用core.plugin.pop获取
     */
    pop: any[];
}

type Forward<T> = {
    [K in keyof T as T[K] extends Function
        ? K extends `_${string}`
            ? never
            : K
        : never]: T[K];
};

type ForwardKeys<T> = keyof Forward<T>;

type SpriteMouseEvent = (px: number, py: number) => void;

type SpritKeyEvent = (
    key: string,
    keyCode: number,
    altKey: boolean,
    ctrlKey: boolean,
    shiftKey: boolean
) => void;

type SpriteWheelEvent = (
    deltaY: number,
    deltaX: number,
    deltaZ: number
) => void;

type SpriteTouchEvent = (...locs: [number, number][]) => void;

interface SpriteEvent {
    click: SpriteMouseEvent;
    mousedown: SpriteMouseEvent;
    mouseup: SpriteMouseEvent;
    mouseenter: SpriteMouseEvent;
    mouseleave: SpriteMouseEvent;
    mousemove: SpriteMouseEvent;
    keydown: SpritKeyEvent;
    keyup: SpritKeyEvent;
    keypress: SpritKeyEvent;
    wheel: SpriteWheelEvent;
    touchstart: SpriteTouchEvent;
    touchend: SpriteTouchEvent;
    touchmove: SpriteTouchEvent;
    touchcancel: SpriteTouchEvent;
}

declare class Sprite {
    /**
     * 递增的sprite标识符
     */
    static count: number;

    /**
     * sprite的左上角横坐标
     */
    x: number;

    /**
     * sprite的左上角纵坐标
     */
    y: number;

    /**
     * sprite的宽度
     */
    width: number;

    /**
     * sprite的高度
     */
    height: number;

    /**
     * sprite的纵深
     */
    zIndex: number;

    /**
     * sprite的相对模式，相对游戏还是相对窗口
     */
    reference: 'game' | 'window';

    /**
     * sprite的canvas元素
     */
    canvas: HTMLCanvasElement;

    /**
     * sprite的context
     */
    context: CanvasRenderingContext2D;

    /**
     * sprite的名称
     */
    name: string;

    /**
     * spirte的唯一标识符
     */
    readonly count: number;

    /**
     * 创建一个sprite画布
     * @param reference 参考系，游戏画面或者窗口
     * @param name 可选，sprite的名称，方便通过core.dymCanvas获取
     */
    constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        z: number,
        reference?: 'game' | 'window',
        name?: string
    );

    /**
     * 初始化
     */
    init(): void;

    /**
     * @deprecated
     * 设置css特效，使用css()代替
     */
    setCss(css: string): Sprite;

    /**
     * 设置css特效
     */
    css(css: string): Sprite;

    /**
     * 移动sprite
     * @param isDelta 是否是相对位置，如果是，那么sprite会相对于原先的位置进行移动
     */
    move(x: number, y: number, isDelta?: boolean): Sprite;

    /**
     * 重新设置sprite的大小
     * @param {boolean} styleOnly 是否只修改css效果，如果是，那么将会不高清，如果不是，那么会清空画布
     */
    resize(w: number, h: number, styleOnly?: boolean): Sprite;

    /**
     * 旋转画布
     */
    rotate(angle: number, cx?: number, cy?: number): Sprite;

    /**
     * 擦除画布
     */
    clear(x?: number, y?: number, w?: number, h?: number): Sprite;

    /**
     * 删除
     */
    destroy(): void;

    /**
     * 监听事件，与registerAction类似
     */
    on<K extends keyof SpriteEvent>(type: K, handler: SpriteEvent[K]): void;

    /**
     * 添加事件监听器
     */
    addEventListener: HTMLCanvasElement['addEventListener'];

    /**
     * 删除事件监听器
     */
    removeEventListenr: HTMLCanvasElement['removeEventListener'];
}
