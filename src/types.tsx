interface Board {
    pieces: Piece[][];
}

interface Piece {
    color: TetraColor;
    isOccupied: boolean;
}

enum TetraColor {
    RED,
    BLUE,
    GREEN,
    YELLOW,
    ORANGE,
    CYAN,
    PURPLE,
    GHOST,
    GARBAGE,
    UNCLEARABLE
}
