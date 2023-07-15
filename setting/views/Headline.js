export function Headline(text) {
    return View({
        style: {
            margin: "8px 0",
            color: "#16b48d",
            fontSize: ".9em"
        }
    }, [
        Text({bold: true}, text)]
    );
}