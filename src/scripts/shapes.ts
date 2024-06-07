const ranges = () => {
    const items = Array.from(document.querySelectorAll('input[type="range"]')) as HTMLInputElement[];

    for (const item of items) {
        const event = () => {
            item.setAttribute("value", item.value)
            item.title = `${item.value} générations par seconde`
        }
        item.addEventListener('change', event);
        item.addEventListener('input', event);
        item.addEventListener("drag", event)

        // Init
        event()
    }
}

ranges()