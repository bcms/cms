export async function delay(time: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, time));
}
