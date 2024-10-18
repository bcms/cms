export function base10Padding(num: number) {
    return num < 10 ? `0${num}` : '' + num;
}
