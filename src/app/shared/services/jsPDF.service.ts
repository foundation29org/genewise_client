import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
declare let html2canvas: any;
import { jsPDF } from "jspdf";

@Injectable()
export class jsPDFService {
    constructor(public translate: TranslateService) {}
    
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

    private newHeatherAndFooter(doc) {
        // Footer
        const logoHealth = new Image();
        logoHealth.src = "assets/img/logo-foundation-twentynine-footer.png";
        doc.addImage(logoHealth, 'png', 20, 280, 25, 10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
    }

    private getFormatDate(date) {
        let localeLang = 'en-US';
        if (this.lang == 'es') {
            localeLang = 'es-ES';
        } else if (this.lang == 'de') {
            localeLang = 'de-DE';
        } else if (this.lang == 'fr') {
            localeLang = 'fr-FR';
        } else if (this.lang == 'it') {
            localeLang = 'it-IT';
        } else if (this.lang == 'pt') {
            localeLang = 'pt-PT';
        }
        return date.toLocaleString(localeLang, { month: 'long', day: 'numeric', year: 'numeric' });
    }

    private pad(number) {
        return number < 10 ? '0' + number : number;
    }
    
    private checkIfNewPage(doc, lineText) {
        if (lineText < 270) {
            return lineText;
        } else {
            doc.addPage();
            this.newHeatherAndFooter(doc);
            return 20;
        }
    }

    private getDate() {
        const date = new Date();
        return date.getUTCFullYear() + this.pad(date.getUTCMonth() + 1) + this.pad(date.getUTCDate()) + 
               this.pad(date.getUTCHours()) + this.pad(date.getUTCMinutes()) + this.pad(date.getUTCSeconds());
    }

    private writeAboutUs(doc, lineText) {
        lineText = this.checkIfNewPage(doc, lineText);
        doc.setFont(undefined, 'bold');
        doc.text(this.translate.instant("generics.Exemption of liability"), 10, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer1"), lineText += 5);
        lineText = this.checkIfNewPage(doc, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer2"), lineText += 5);
        lineText = this.checkIfNewPage(doc, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer3"), lineText += 5);
        lineText = this.checkIfNewPage(doc, lineText);
        this.writelinePreFooter(doc, this.translate.instant("about.footer4"), lineText += 5);
        if(this.lang == 'es') {
            lineText = this.checkIfNewPage(doc, lineText);
            this.writelinePreFooter(doc, this.translate.instant("about.footer5"), lineText += 5);
        }     
        lineText = this.checkIfNewPage(doc, lineText);
        doc.setTextColor(0, 0, 0);
        lineText += 5;
        doc.setFontSize(9);
        doc.setTextColor(117, 120, 125);
        doc.text(this.translate.instant("about.footer6"), 10, lineText += 5);
        doc.setTextColor(51, 101, 138);
        const url = "mailto:info@foundation29.org";
        doc.textWithLink("info@foundation29.org", (((this.translate.instant("about.footer6")).length*2)-18), lineText, { url: url });
        doc.setTextColor(0, 0, 0);
    }

    writelinePreFooter(doc, text, lineText) {
        doc.setFontSize(9);
        doc.setTextColor(117, 120, 125);
        doc.setFont(undefined, 'normal');
        doc.text(text, 10, lineText);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
    }

    async generateResultsPDF(summary: string, lang: string, qrCodeDataURL: string | null): Promise<void> {
        this.lang = lang;
        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
        const pageHeight = doc.internal.pageSize.getHeight() - margin * 2;
        const firstPageHeaderHeight = 35;
        const otherPagesHeaderHeight = 10;
        const footerHeight = 20;
        let currentHeight = margin + firstPageHeaderHeight;
    
        // -- Start Refactored Header --
        const pageFullWidth = doc.internal.pageSize.getWidth();
        const headerStartY = 15; // Starting Y position for header elements
        const headerContentY = headerStartY + 5; // Y position for logo and date text
        const titleY = headerStartY + 18; // Y position for the title
        const lineY = headerStartY + 22; // Y position for the separator line

        // Preload images to get dimensions
        const img_logo = new Image();
        img_logo.src = "assets/img/logo_sjd.png";
        
        // Load and measure SJD image
        const sjdImg = await this.loadImage(img_logo.src);
        
        // SJD logo dimensions (adjust width if needed)
        const sjdWidth = 45; 
        const sjdHeight = (sjdImg.height * sjdWidth) / sjdImg.width;
        
        // Draw SJD logo (aligned left with margin)
        doc.addImage(sjdImg, 'PNG', margin, headerContentY - (sjdHeight / 2), sjdWidth, sjdHeight);

        // Get date text
        const actualDate = new Date();
        const dateHeader = this.getFormatDate(actualDate);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        // Draw date (centered)
        doc.text(dateHeader, pageFullWidth / 2, headerContentY, { align: 'center' });

        // Draw Title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        const reportTitle = this.translate.instant("pdf.reportTitle", {defaultValue: "Genewise Report"});
        doc.text(reportTitle, pageFullWidth / 2, titleY, { align: 'center' });
        doc.setFont(undefined, 'normal'); // Reset font style

        // Draw separator line
        doc.setDrawColor(180, 180, 180); // Light gray line
        doc.line(margin, lineY, pageFullWidth - margin, lineY);

        // Adjust starting height for the content based on the new header
        // Note: The original currentHeight calculation might need adjustment if 
        // firstPageHeaderHeight was used differently. Setting a fixed start.
        currentHeight = lineY + 10; // Start content below the line + padding

        // F29 logo dimensions (keep for potential future use, but don't draw)
        /* 
        const logoF29 = new Image();
        logoF29.src = "assets/img/logo-foundation-twentynine-footer.png";
        const f29Img = await this.loadImage(logoF29.src);
        const f29Width = 32;
        const f29Height = (f29Img.height * f29Width) / f29Img.width;
        */
        // -- End Refactored Header --
        
        doc.setFontSize(10); // Reset font size for main content potentially
        
        // Keep the original footer logic call if needed for other pages
        this.newHeatherAndFooter(doc);
    
        const element = document.createElement('div');
        element.innerHTML = summary;
        
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordBreak = 'break-word';
        element.style.fontFamily = 'Arial, Helvetica, sans-serif';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        element.style.padding = '10px';

        const images = await this.generateImagesFromHTML(element, pageWidth, pageHeight - firstPageHeaderHeight - footerHeight);
        let pageNumber = 1;
    
        for (const imgData of images) {
            if (pageNumber > 1) {
                doc.addPage();
                this.newHeatherAndFooter(doc);
                currentHeight = margin + otherPagesHeaderHeight;
            }
    
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
    
        // Añadir información de Foundation 29
        const MIN_SPACE_NEEDED = 70;
        const PAGE_BOTTOM_MARGIN = 260;
        
        if (currentHeight > PAGE_BOTTOM_MARGIN - MIN_SPACE_NEEDED) {
            doc.addPage();
            this.newHeatherAndFooter(doc);
            this.writeAboutUs(doc, 40);
        } else {
            this.writeAboutUs(doc, currentHeight + 10);
        }
    
        // Numeración de páginas
        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = this.translate.instant("pdf.page") + ' ' + i + '/' + pageCount;
            doc.text(pageText, pageWidth/2, 285, { align: 'center' });
        }
    
        const date = this.getDate();
        doc.save('Genewise_Report_' + date + '.pdf');
    }

    private async generateImagesFromHTML(element: HTMLElement, pageWidth: number, pageHeight: number): Promise<string[]> {
        const images: string[] = [];
        const canvasWidth = 1024;
        const canvasHeight = Math.round((canvasWidth * (pageHeight-5)) / pageWidth);
    
        document.body.appendChild(element);
        
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
                        logging: false,
                        onclone: (clonedDoc) => {
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
    
        document.body.removeChild(element);
        return images;
    }

    async generateResultsPDF2(summary, lang, qrCodeDataURL) {
        this.lang = lang;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let lineText = 45;
    
        // -- Start Refactored Header --
        const margin = 10; // Define margin if not already available
        const pageFullWidth = doc.internal.pageSize.getWidth();
        const headerStartY = 15; // Starting Y position for header elements
        const headerContentY = headerStartY + 5; // Y position for logo and date text
        const titleY = headerStartY + 18; // Y position for the title
        const lineY = headerStartY + 22; // Y position for the separator line

        // Preload images to get dimensions
        const img_logo = new Image();
        img_logo.src = "assets/img/logo_sjd.png";
        
        // Load and measure SJD image
        const sjdImg = await this.loadImage(img_logo.src);
        
        // SJD logo dimensions (adjust width if needed)
        const sjdWidth = 45; 
        const sjdHeight = (sjdImg.height * sjdWidth) / sjdImg.width;
        
        // Draw SJD logo (aligned left with margin)
        doc.addImage(sjdImg, 'PNG', margin, headerContentY - (sjdHeight / 2), sjdWidth, sjdHeight);

        // Get date text
        const actualDate = new Date();
        const dateHeader = this.getFormatDate(actualDate);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        // Draw date (centered)
        doc.text(dateHeader, pageFullWidth / 2, headerContentY, { align: 'center' });

        // Draw Title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        const reportTitle = this.translate.instant("pdf.reportTitle", {defaultValue: "Genewise Report"});
        doc.text(reportTitle, pageFullWidth / 2, titleY, { align: 'center' });
        doc.setFont(undefined, 'normal'); // Reset font style

        // Draw separator line
        doc.setDrawColor(180, 180, 180); // Light gray line
        doc.line(margin, lineY, pageFullWidth - margin, lineY);

        // Adjust starting Y position for the content
        lineText = lineY + 10; // Start content below the line + padding

        // F29 logo dimensions (keep for potential future use, but don't draw)
        /* 
        const logoF29 = new Image();
        logoF29.src = "assets/img/logo-foundation-twentynine-footer.png";
        const f29Img = await this.loadImage(logoF29.src);
        const f29Width = 32;
        const f29Height = (f29Img.height * f29Width) / f29Img.width;
        */
        // Comment out original F29 draw call
        // doc.addImage(f29Img, 'png', startX + sjdWidth + spacing + dateWidth + spacing, 
        //             headerMiddleY - (f29Height/2), f29Width, f29Height);
        // -- End Refactored Header --
        
        doc.setFontSize(10); // Reset font size for main content potentially
        
        // Keep the original footer logic call if needed for other pages
        this.newHeatherAndFooter(doc);
    
        const parser = new DOMParser();
        const docHTML = parser.parseFromString(summary, 'text/html');
        const elements = Array.from(docHTML.body.childNodes);
    
        for (const element of elements) {
            lineText = await this.processElement(element, doc, lineText);
            lineText = this.checkIfNewPage(doc, lineText);
        }
    
        const MIN_SPACE_NEEDED = 70;
        const PAGE_BOTTOM_MARGIN = 260;
        
        if (lineText > PAGE_BOTTOM_MARGIN - MIN_SPACE_NEEDED) {
            doc.addPage();
            this.newHeatherAndFooter(doc);
            this.writeAboutUs(doc, 40);
        } else {
            lineText += 10;
            this.writeAboutUs(doc, lineText);
        }
    
        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = this.translate.instant("pdf.page") + ' ' + i + '/' + pageCount;
            doc.text(pageText, pageWidth/2, 285, { align: 'center' });
        }
    
        const date = this.getDate();
        doc.save('Genewise_Report_' + date + '.pdf');
    }

    private async loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error('Error al cargar la imagen:', src);
                const placeholderImg = new Image();
                placeholderImg.width = 100;
                placeholderImg.height = 100;
                resolve(placeholderImg);
            };
            img.src = src;
        });
    }

    async processElement(node, doc, lineText) {
        const PAGE_BOTTOM_MARGIN = 270;
        const MIN_SPACE_AFTER_HEADER = 8;
        const HEADER_HEIGHT = 12;

        if (node.nodeType === Node.TEXT_NODE) {
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
                    if (lineText + HEADER_HEIGHT + MIN_SPACE_AFTER_HEADER > PAGE_BOTTOM_MARGIN) {
                        doc.addPage();
                        this.newHeatherAndFooter(doc);
                        lineText = 20;
                    }
                    
                    let fontSize;
                    if (node.tagName === 'H1') fontSize = 13;
                    else if (node.tagName === 'H2') fontSize = 12;
                    else fontSize = 11;

                    doc.setFontSize(fontSize);
                    doc.setFont(undefined, 'bold');
                    lineText += 3;
                    doc.text(node.textContent.trim(), 10, lineText);
                    
                    lineText += (node.tagName === 'H1') ? 6 : 4;
                    
                    doc.setFont(undefined, 'normal');
                    break;
                case 'P':
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    
                    const text = node.textContent.trim();
                    lineText = this.writeLineUnique(doc, text, lineText, false);
                    
                    if (!/^\d+\.\d+(\s+|\.)/.test(text)) {
                        lineText += 2.5;
                    }
                    break;
                case 'UL':
                    for (const liNode of node.childNodes) {
                        lineText = await this.processElement(liNode, doc, lineText);
                    }
                    lineText += 2;
                    break;
                case 'LI':
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    const liText = node.textContent.trim().replace(/\s+/g, ' ');
                    if (liText.length > 0) {
                        lineText = this.writeLineUnique(doc, liText, lineText, true);
                    } else {
                        lineText += 2;
                    }
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
                                const imgWidth = Math.min(maxWidth, 150);
                                const imgHeight = (img.height * imgWidth) / img.width;
                                
                                if (lineText + imgHeight + 20 > PAGE_BOTTOM_MARGIN) {
                                    doc.addPage();
                                    this.newHeatherAndFooter(doc);
                                    lineText = 20;
                                }

                                const xPos = (pageWidth - imgWidth) / 2;
                                lineText += 4;
                                doc.addImage(img, 'PNG', xPos, lineText, imgWidth, imgHeight);
                                lineText += imgHeight + 4;
                            } catch (error) {
                                console.error('Error loading image:', error);
                            }
                        }
                    } else {
                        for (const childNode of node.childNodes) {
                            lineText = await this.processElement(childNode, doc, lineText);
                        }
                    }
                    break;
                case 'IMG':
                    try {
                        const img = await this.loadImage(node.src);
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const margin = 10;
                        const maxWidth = pageWidth - (margin * 2);
                        const imgWidth = Math.min(maxWidth, 150);
                        const imgHeight = (img.height * imgWidth) / img.width;

                        if (lineText + imgHeight + 10 > PAGE_BOTTOM_MARGIN) {
                            doc.addPage();
                            this.newHeatherAndFooter(doc);
                            lineText = 20;
                        }

                        const xPos = (pageWidth - imgWidth) / 2;
                        doc.addImage(img, 'PNG', xPos, lineText, imgWidth, imgHeight);
                        lineText += imgHeight + 4;
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
        const LINE_HEIGHT = 3.8;
        const MAX_WIDTH = 190;
        const LIST_ITEM_MAX_WIDTH = 175;

        if (!text || text.trim().length === 0) {
            return lineText;
        }

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        let label = '';
        let value = '';
        const match = text.match(/^([\w\s]+:)\s*(.*)/);

        if (match && match[1] && match[2]) {
            label = match[1].trim() + ' ';
            value = match[2].trim();
        }

        const isNumberedHeading = /^\d+\.\d+(\s+|\.)/.test(text);
        if (isNumberedHeading) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            lineText += 3;
        }

        if (isListItem) {
            const lines = doc.splitTextToSize(text, LIST_ITEM_MAX_WIDTH);
            for (let i = 0; i < lines.length; i++) {
                if (lineText > PAGE_BOTTOM_MARGIN) {
                    doc.addPage();
                    this.newHeatherAndFooter(doc);
                    lineText = 20;
                }
                if (i === 0) {
                    doc.text('•', 10, lineText);
                }
                doc.text(lines[i], TEXT_LEFT_MARGIN, lineText);
                lineText += LINE_HEIGHT;
            }
            return lineText;
        }

        let currentX = TEXT_LEFT_MARGIN;
        const lines = doc.splitTextToSize(text, MAX_WIDTH);

        for (const line of lines) {
            if (lineText > PAGE_BOTTOM_MARGIN) {
                doc.addPage();
                this.newHeatherAndFooter(doc);
                lineText = 20;
                currentX = TEXT_LEFT_MARGIN;
            }

            if (label && value && line.startsWith(label.trim())) {
                doc.setFont(undefined, 'bold');
                doc.text(label, currentX, lineText);

                const labelWidth = doc.getTextWidth(label);

                doc.setFont(undefined, 'normal');
                const remainingLineText = line.substring(label.length);
                doc.text(remainingLineText, currentX + labelWidth, lineText);

                label = '';
            } else {
                doc.setFont(undefined, 'normal');
                doc.text(line, currentX, lineText);
            }

            lineText += LINE_HEIGHT;
        }

        if (isNumberedHeading) {
            lineText += 3;
        }

        return lineText;
    }

    getMonthFromString(mon) {
        if (this.lang != 'es') {
            return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
        } else {
            return new Date(Date.parse(this.meses[mon] + " 1, 2012")).getMonth() + 1;
        }
    }
}
