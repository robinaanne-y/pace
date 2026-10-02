// jsdom does not implement the <dialog> methods or scrolling that the application uses.
HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
};

HTMLDialogElement.prototype.close = function close() {
    if (this.hasAttribute('open')) {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
    }
};

Element.prototype.scrollIntoView = function scrollIntoView() {};
