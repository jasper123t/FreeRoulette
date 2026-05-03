export const spin = (table: number) => {
    let tiles;
    switch (table) {
        case 0:
            tiles = 37; // European
            break;
        case 1:
            tiles = 38; // American
            break;
        default:
            tiles = 37;
            break;
    } 
    return Math.floor(Math.random() * tiles);
};
