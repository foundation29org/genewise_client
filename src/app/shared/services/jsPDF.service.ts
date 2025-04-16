import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
declare let html2canvas: any;
import { jsPDF } from "jspdf";

@Injectable()
export class jsPDFService {
    constructor(public translate: TranslateService) {
    }
    lang: string = '';
    meses: any = {
        "enero": "January",
        "febrero": "February",
        "marzo": "March",
        "abril": "April",
        "mayo": "May",
        "junio": "June",
        "julio": "July",
        "agosto": "August",
        "septiembre": "September",
        "octubre": "October",
        "noviembre": "November",
        "diciembre": "December"
    };
    maxCharsPerLine = 120;

    private newHeatherAndFooter(doc){
        // Footer
        var logoHealth = new Image();
        logoHealth.src = "assets/img/logo-foundation-twentynine-footer.png"
        doc.addImage(logoHealth, 'png', 20, 284, 25, 10);
        doc.setFont(undefined, 'normal');
        /*doc.setFontSize(10);
        doc.setTextColor(51, 101, 138)
        doc.textWithLink("https://nav29.org", 148, 290, { url: 'https://nav29.org' });*/
        doc.setTextColor(0, 0, 0);
    }

    private getFormatDate(date) {
        var localeLang = 'en-US';
        if (this.lang == 'es') {
            localeLang = 'es-ES'
        }else if (this.lang == 'de') {
            localeLang = 'de-DE'
        }else if (this.lang == 'fr') {
            localeLang = 'fr-FR'
        }else if (this.lang == 'it') {
            localeLang = 'it-IT'
        }else if (this.lang == 'pt') {
            localeLang = 'pt-PT'
        }
        return date.toLocaleString(localeLang, { month: 'long' , day: 'numeric', year: 'numeric'});
    }

    private pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
    private checkIfNewPage(doc, lineText) {
        if (lineText < 270) {
            return lineText
        }
        else {
            doc.addPage()
            this.newHeatherAndFooter(doc)
            lineText = 20;
            return lineText;
        }
    }  
    

    private writeDataHeader(doc, pos, lineText, text) {
        doc.setTextColor(0, 0, 0)
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text(text, pos, lineText += 20);
    }

    private getDate() {
        var date = new Date()
        return date.getUTCFullYear() + this.pad(date.getUTCMonth() + 1) + this.pad(date.getUTCDate()) + this.pad(date.getUTCHours()) + this.pad(date.getUTCMinutes()) + this.pad(date.getUTCSeconds());
    };

    private writeAboutUs(doc,lineText){
        lineText = this.checkIfNewPage(doc, lineText);
        doc.setFont(undefined, 'bold');
        doc.text(this.translate.instant("generics.Foundation 29"), 10, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer1"), lineText += 5);
        lineText = this.checkIfNewPage(doc, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer2"), lineText += 5);
        lineText = this.checkIfNewPage(doc, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer3"), lineText += 5);
        if(this.lang =='es'){
            lineText = this.checkIfNewPage(doc, lineText);
            this.writelinePreFooter(doc, this.translate.instant("about.footer4"), lineText += 5);
        }     
        lineText = this.checkIfNewPage(doc, lineText);
        doc.setTextColor(0, 0, 0)
        lineText += 5;
        doc.setFontSize(9);
        doc.setTextColor(117, 120, 125)
        doc.text(this.translate.instant("about.footer6"), 10, lineText += 5);
        doc.setTextColor(51, 101, 138)
        var url = "mailto:info@foundation29.org";
        doc.textWithLink("info@foundation29.org", (((this.translate.instant("about.footer6")).length*2)-18), lineText, { url: url });
        //lineText = this.checkIfNewPage(doc, lineText);
        doc.setTextColor(0, 0, 0);
    }

    writelinePreFooter(doc, text, lineText){
        doc.setFontSize(9);
        doc.setTextColor(117, 120, 125)
        doc.setFont(undefined, 'normal');
        doc.text(text, 10, lineText);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
    }

    async generateResultsPDF(summary: string, lang: string, qrCodeDataURL: string | null): Promise<void> {
        console.log(summary);
        this.lang = lang;
        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
        const pageHeight = doc.internal.pageSize.getHeight() - margin * 2;
        const firstPageHeaderHeight = 35;
        const otherPagesHeaderHeight = 10;
        const footerHeight = 20;
        let currentHeight = margin + firstPageHeaderHeight;
    
        // Cabecera inicial
        const img_logo = new Image();
        img_logo.src = "assets/img/logo-lg-white.png";
        doc.addImage(img_logo, 'PNG', 10, 17, 54, 15);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const actualDate = new Date();
        const dateHeader = this.getFormatDate(actualDate);
        this.writeDataHeader(doc, lang === 'es' ? 87 : 93, 5, dateHeader);
    
        // Añadir QR
        const img_qr = new Image();
        if (qrCodeDataURL == null) {
            img_qr.src = "assets/img/elements/qr.png";
            doc.addImage(img_qr, 'PNG', 160, 5, 32, 30);
            doc.setFontSize(8);
            const qrUrl = 'https://nav29.org';
            const urlWidth = doc.getTextWidth(qrUrl);
            doc.text(qrUrl, 160 + (32/2) - (urlWidth/2), 37);
        } else {
            img_qr.src = qrCodeDataURL;
            doc.addImage(img_qr, 'PNG', 160, 5, 32, 30);
            doc.setFontSize(8);
            const qrText = this.translate.instant("pdf.Scan to rate the summary");
            const textWidth = doc.getTextWidth(qrText);
            doc.text(qrText, 160 + (32/2) - (textWidth/2), 37);
        }
        doc.setFontSize(10);
    
        this.newHeatherAndFooter(doc);
    
        const element = document.createElement('div');
        // No eliminar los saltos de línea que ya están presentes en el HTML
        element.innerHTML = summary;
        
        // Aplicar estilos para asegurar que se respeten los espacios
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordBreak = 'break-word';
        element.style.fontFamily = 'Arial, Helvetica, sans-serif';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        element.style.padding = '10px';

        const images = await this.generateImagesFromHTML(element, pageWidth, pageHeight - firstPageHeaderHeight - footerHeight);
        console.log(images);
        let pageNumber = 1;
    
        for (const imgData of images) {
            if (pageNumber > 1) {
                doc.addPage();
                this.newHeatherAndFooter(doc);
                currentHeight = margin + otherPagesHeaderHeight;
            }
    
            // Create a new Image object to get the actual width and height of the generated image
            const img = new Image();
            img.src = imgData;
            await new Promise((resolve) => {
                img.onload = () => {
                    const imgHeight = (img.height * pageWidth) / img.width;
                    doc.addImage(imgData, 'PNG', margin, currentHeight, pageWidth, imgHeight);
                    currentHeight += imgHeight + 10;
                    resolve(null);
                };
            });
    
            pageNumber++;
        }
    
        // Crear una nueva página para Foundation 29
        doc.addPage();
        this.newHeatherAndFooter(doc);
        // Iniciar desde la parte superior de la página con margen
        this.writeAboutUs(doc, 40);
    
        const pageCount = doc.internal.pages.length; // Total Page Number
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = this.translate.instant("pdf.page") + ' ' + i + '/' + pageCount;
            doc.text(pageText, pageWidth/2, 290, { align: 'center' });
        }
    
        const date = this.getDate();
        doc.save('Genewise_Report_' + date + '.pdf');
    }

    private async generateImagesFromHTML(element: HTMLElement, pageWidth: number, pageHeight: number): Promise<string[]> {
        const images: string[] = [];
        const canvasWidth = 1024; // Ajusta según tu necesidad
        const canvasHeight = Math.round((canvasWidth * (pageHeight-5)) / pageWidth); // Mantén la proporción
    
        document.body.appendChild(element); // Asegúrate de que el elemento esté en el DOM
        
        // Asegurar que todos los estilos estén aplicados antes de medir
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const totalHeight = element.scrollHeight;
        let currentHeight = 0;
    
        while (currentHeight < totalHeight) {
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
    
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                try {
                    await html2canvas(element, {
                        canvas: canvas,
                        width: canvasWidth,
                        height: totalHeight,
                        scrollX: 0,
                        scrollY: -currentHeight,
                        windowHeight: canvasHeight,
                        useCORS: true,
                        logging: false, // Reducir mensajes de consola
                        onclone: (clonedDoc) => {
                            // Asegurar que los estilos se mantengan en el clon
                            const clonedElement = clonedDoc.body.querySelector('div');
                            if (clonedElement) {
                                clonedElement.style.whiteSpace = 'pre-wrap';
                                clonedElement.style.wordBreak = 'break-word';
                            }
                        }
                    });
    
                    const imgData = canvas.toDataURL('image/png');
                    images.push(imgData);
                } catch (error) {
                    console.error("Error generating image from HTML:", error);
                    break;
                }
            }
    
            currentHeight += canvasHeight;
        }
    
        document.body.removeChild(element); // Limpia el DOM
        return images;
    }

    async generateResultsPDF2(summary, lang, qrCodeDataURL) {
        // Crear el documento PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth(); // Definir pageWidth para usar en textos centrados
        var lineText = 45; // Inicialización de la posición Y para el contenido del PDF
    
        // Cabecera inicial con el logo
        var img_logo = new Image();
        img_logo.src = "assets/img/logo-lg-white.png";
        await this.loadImage(img_logo.src).then(img => {
            doc.addImage(img, 'png', 10, 17, 54, 15);
        });
    
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
    
        var actualDate = new Date();
        var dateHeader = this.getFormatDate(actualDate);
        if (lang == 'es') {
            this.writeDataHeader(doc, 87, 5, dateHeader);
        } else {
            this.writeDataHeader(doc, 93, 5, dateHeader);
        }
    
        // Añadir QR
        if (qrCodeDataURL == null) {
            var img_qr = new Image();
            img_qr.src = "assets/img/elements/qr.png";
            await this.loadImage(img_qr.src).then(img => {
                doc.addImage(img, 'png', 160, 5, 32, 30);
                doc.setFontSize(8);
                const qrUrl = 'https://nav29.org';
                const urlWidth = doc.getTextWidth(qrUrl);
                doc.text(qrUrl, 160 + (32/2) - (urlWidth/2), 37);
            });
        } else {
            var img_qr = new Image();
            img_qr.src = qrCodeDataURL;
            await this.loadImage(qrCodeDataURL).then(img => {
                doc.addImage(img, 'png', 160, 5, 32, 30);
                doc.setFontSize(8);
                const qrText = this.translate.instant("pdf.Scan to rate the summary");
                const textWidth = doc.getTextWidth(qrText);
                doc.text(qrText, 160 + (32/2) - (textWidth/2), 37);
            });
        }
    
        this.newHeatherAndFooter(doc);
    
        // Parser del HTML - No eliminar los saltos de línea que ya fueron añadidos
        const parser = new DOMParser();
        const docHTML = parser.parseFromString(summary, 'text/html');
        const elements = Array.from(docHTML.body.childNodes); // Obtener todos los nodos hijos del cuerpo
    
        // Procesar cada elemento del HTML
        for (const element of elements) {
            lineText = await this.processElement(element, doc, lineText);
            lineText = this.checkIfNewPage(doc, lineText);
        }
    
        // Crear una nueva página para Foundation 29
        doc.addPage();
        this.newHeatherAndFooter(doc);
        // Iniciar desde la parte superior de la página con margen
        this.writeAboutUs(doc, 40);
    
        // Footer y numeración de páginas
        var pageCount = doc.internal.pages.length - 1;
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = this.translate.instant("pdf.page") + ' ' + i + '/' + pageCount;
            doc.text(pageText, pageWidth/2, 290, { align: 'center' });
        }
    
        var date = this.getDate();
        doc.save('Genewise_Report_' + date + '.pdf');
    }

    private async loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Para evitar problemas CORS con imágenes externas
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error('Error al cargar la imagen:', src);
                // Creamos una imagen de placeholder muy simple para evitar errores
                const placeholderImg = new Image();
                placeholderImg.width = 100;
                placeholderImg.height = 100;
                resolve(placeholderImg);
            };
            img.src = src;
        });
    }

    async processElement(node, doc, lineText) {
        const PAGE_BOTTOM_MARGIN = 270; // Margen inferior estimado para evitar cortes
        const MIN_SPACE_AFTER_HEADER = 8; // Espacio después de título
        const HEADER_HEIGHT = 12; // Altura estimada de un título (5 antes + 7 después)

        if (node.nodeType === Node.TEXT_NODE) {
            // Preservar los saltos de línea que puedan existir en los nodos de texto
            const text = node.textContent;
            if (text && text.trim().length > 0) {
                doc.setFontSize(9);
                lineText = this.writeLineUnique(doc, text, lineText, false);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName) {
                case 'H1':
                case 'H2':
                case 'H3':
                    // Evitar títulos huérfanos
                    if (lineText + HEADER_HEIGHT + MIN_SPACE_AFTER_HEADER > PAGE_BOTTOM_MARGIN) {
                        doc.addPage();
                        this.newHeatherAndFooter(doc);
                        lineText = 20; // Posición inicial en nueva página
                    }
                    
                    let fontSize;
                    if (node.tagName === 'H1') fontSize = 13;
                    else if (node.tagName === 'H2') fontSize = 12;
                    else fontSize = 11; // H3

                    doc.setFontSize(fontSize);
                    doc.setFont(undefined, 'bold');
                    lineText += 3; // Espacio antes del título
                    doc.text(node.textContent.trim(), 10, lineText);
                    
                    // Más espacio después de títulos H1, espacio normal para otros
                    if (node.tagName === 'H1') {
                        lineText += 6; // Mayor espacio después de títulos de primer nivel
                    } else {
                        lineText += 4; // Espacio normal después de otros títulos
                    }
                    
                    doc.setFont(undefined, 'normal');
                    break;
                case 'P':
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    
                    // Comprobar si el párrafo contiene un encabezado numerado
                    const text = node.textContent.trim();
                    
                    // Ya no necesitamos configuración especial aquí ya que se maneja en writeLineUnique
                    lineText = this.writeLineUnique(doc, text, lineText, false);
                    
                    // El espacio adicional para encabezados numerados se maneja en writeLineUnique
                    if (!/^\d+\.\d+(\s+|\.)/.test(text)) {
                        lineText += 2.5; // Espacio adecuado después de párrafos
                    }
                    break;
                case 'UL':
                    for (const liNode of node.childNodes) {
                        lineText = await this.processElement(liNode, doc, lineText);
                    }
                    lineText += 2; // Espacio adecuado después de la lista
                    break;
                case 'LI':
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    // Obtener el texto sin exceso de espacios en blanco
                    const liText = node.textContent.trim().replace(/\s+/g, ' ');
                    // Solo procesar si hay texto
                    if (liText.length > 0) {
                        lineText = this.writeLineUnique(doc, liText, lineText, true);
                    } else {
                        // Si no hay texto, avanzar un poco el lineText para que la lista no se comprima
                        lineText += 2;
                    }
                    // No añadimos espacio extra aquí, se maneja en writeLineUnique y después de UL
                    break;
                case 'DIV':
                    if (node.classList && node.classList.contains('text-center') && node.classList.contains('mb-3')) {
                        const imgElement = node.querySelector('img');
                        if (imgElement) {
                            try {
                                const img = await this.loadImage(imgElement.src);
                                const pageWidth = doc.internal.pageSize.getWidth();
                                const margin = 10;
                                const maxWidth = pageWidth - (margin * 2);
                                const imgWidth = Math.min(maxWidth, 112); // Reducimos a 3/4 del tamaño anterior (150*0.75=112.5)
                                const imgHeight = (img.height * imgWidth) / img.width;
                                
                                // Comprobar si la imagen cabe en la página actual
                                if (lineText + imgHeight + 20 > PAGE_BOTTOM_MARGIN) { // 10 antes + 10 después
                                    doc.addPage();
                                    this.newHeatherAndFooter(doc);
                                    lineText = 20;
                                }

                                const xPos = (pageWidth - imgWidth) / 2;
                                lineText += 4; // Espacio adecuado antes de la imagen
                                doc.addImage(img, 'PNG', xPos, lineText, imgWidth, imgHeight);
                                lineText += imgHeight + 4; // Espacio adecuado después de la imagen
                            } catch (error) {
                                console.error('Error loading image:', error);
                            }
                        }
                    } else {
                        // Procesar hijos de DIVs genéricos
                        for (const childNode of node.childNodes) {
                            lineText = await this.processElement(childNode, doc, lineText);
                        }
                    }
                    break;
                case 'IMG':
                    // Manejar imágenes individuales si es necesario (si no están en un DIV)
                    try {
                        const img = await this.loadImage(node.src);
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const margin = 10;
                        const maxWidth = pageWidth - (margin * 2);
                        const imgWidth = Math.min(maxWidth, 112); // Reducimos a 3/4 del tamaño anterior (150*0.75=112.5)
                        const imgHeight = (img.height * imgWidth) / img.width;

                        if (lineText + imgHeight + 10 > PAGE_BOTTOM_MARGIN) { // Asumiendo 10 de espacio después
                            doc.addPage();
                            this.newHeatherAndFooter(doc);
                            lineText = 20;
                        }

                        const xPos = (pageWidth - imgWidth) / 2; // Centrar por defecto
                        // Podríamos necesitar lógica adicional para alinear si no está en un div centrado
                        doc.addImage(img, 'PNG', xPos, lineText, imgWidth, imgHeight);
                        lineText += imgHeight + 4; // Espacio adecuado después de la imagen
                    } catch (error) {
                        console.error('Error loading standalone image:', error);
                    }
                    break;
                default:
                    for (const childNode of node.childNodes) {
                        lineText = await this.processElement(childNode, doc, lineText);
                    }
                    break;
            }
        }
        return lineText;
    }

        writeLineUnique(doc, text, lineText, isListItem) {
        const PAGE_BOTTOM_MARGIN = 270;
        const TEXT_LEFT_MARGIN = isListItem ? 15 : 10;
        const LINE_HEIGHT = 3.8; // Espacio entre líneas más consistente
        const MAX_WIDTH = 190; // Ancho máximo para texto normal
        const LIST_ITEM_MAX_WIDTH = 175; // Ancho para items de lista

        // Si el texto está vacío, devolver lineText sin cambios
        if (!text || text.trim().length === 0) {
            return lineText;
        }

        // Reiniciar estilo (por si acaso viene de un H tag procesado antes)
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        // --- Inicio: Manejo específico para "Etiqueta: Valor" ---
        let label = '';
        let value = '';
        const match = text.match(/^([\w\s]+:)\s*(.*)/); // Busca "Algo con letras y espacios seguido de ':'", captura etiqueta y valor

        if (match && match[1] && match[2]) {
             // Asumimos que la etiqueta viene de un <strong> en el HTML original.
             // Como textContent lo elimina, aquí intentamos deducirlo y aplicar formato.
            label = match[1].trim() + ' '; // Añade un espacio después del ':'
            value = match[2].trim();
        }
        // --- Fin: Manejo específico ---

        // Detectar si es un encabezado numerado (por ejemplo, "3.1 Título")
        const isNumberedHeading = /^\d+\.\d+(\s+|\.)/.test(text);
        if (isNumberedHeading) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            lineText += 3; // Espacio antes de encabezado numerado
        }

        // Procesamiento para elementos de lista (con viñetas)
        if (isListItem) {
            const lines = doc.splitTextToSize(text, LIST_ITEM_MAX_WIDTH);
            for (let i = 0; i < lines.length; i++) {
                if (lineText > PAGE_BOTTOM_MARGIN) {
                    doc.addPage();
                    this.newHeatherAndFooter(doc);
                    lineText = 20;
                }
                if (i === 0) {
                    doc.text('•', 10, lineText); // Viñeta
                }
                doc.text(lines[i], TEXT_LEFT_MARGIN, lineText); // Texto con indentación
                lineText += LINE_HEIGHT;
            }
            return lineText; // Salir temprano para items de lista
        }

        // --- Procesamiento General (incluye el caso "Etiqueta: Valor") ---
        let currentX = TEXT_LEFT_MARGIN;
        const lines = doc.splitTextToSize(text, MAX_WIDTH); // Divide el texto completo

        for (const line of lines) {
            if (lineText > PAGE_BOTTOM_MARGIN) {
                doc.addPage();
                this.newHeatherAndFooter(doc);
                lineText = 20;
                currentX = TEXT_LEFT_MARGIN; // Reiniciar X en nueva página
            }

            // Si detectamos el patrón "Etiqueta: Valor" y estamos en la primera línea
            if (label && value && line.startsWith(label.trim())) {
                // 1. Dibuja la etiqueta en negrita
                doc.setFont(undefined, 'bold');
                doc.text(label, currentX, lineText);

                // 2. Calcula el ancho de la etiqueta
                const labelWidth = doc.getTextWidth(label);

                // 3. Dibuja el valor normalmente, justo después de la etiqueta
                doc.setFont(undefined, 'normal');
                // Extrae la parte del valor que cabe en esta línea
                const remainingLineText = line.substring(label.length);
                doc.text(remainingLineText, currentX + labelWidth, lineText);

                // Marcar que la etiqueta ya fue procesada para no repetirlo en saltos de línea raros
                label = '';

            } else {
                 // Si no es el patrón especial, o es una línea subsiguiente, dibuja normal
                doc.setFont(undefined, 'normal'); // Asegurarse de que esté normal
                doc.text(line, currentX, lineText);
            }

            lineText += LINE_HEIGHT; // Incrementar Y para la siguiente línea
        }

        // Restaurar formato normal si era un encabezado numerado
        if (isNumberedHeading) {
            // No es necesario restaurar aquí si el default al inicio de la función es normal/9pt
            // doc.setFontSize(9);
            // doc.setFont(undefined, 'normal');
            lineText += 3; // Espacio después de encabezado numerado
        }

        return lineText;
    }


    // Order by descending key
    keyDescOrder = ((a, b) => {
        var a_month=a.split("-")[0]
        var a_year = a.split("-")[1]
        var b_month=b.split("-")[0]
        var b_year=b.split("-")[1]
        a_month = this.getMonthFromString(a_month);
        b_month = this.getMonthFromString(b_month);
        if(new Date(a_year).getTime() > new Date(b_year).getTime()){
            return 1;
        }
        else if(new Date(a_year).getTime() < new Date(b_year).getTime()){
            return -1;
        }
        else{
            if(new Date(a_month).getTime() > new Date(b_month).getTime()){
                return 1;
            }
            else if(new Date(a_month).getTime() < new Date(b_month).getTime()){
                return -1;
            }
            else{
                return 0;
            }
        }
    })

    getMonthFromString(mon) {
        if (this.lang != 'es') {
            return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1
        } else {
            var date = new Date(Date.parse(this.meses[mon] + " 1, 2012")).getMonth() + 1;
            return date;
        }

    }

    // Order by descending value
    valueDateDescOrder = ((a,b)=> {
        if(new Date(a).getTime() > new Date(b).getTime()){
            return -1;
        }
        else if(new Date(a).getTime() < new Date(b).getTime()){
            return -1;
        }
        else return 0;
    })

}
