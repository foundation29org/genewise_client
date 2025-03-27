import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TemplateRef, NgZone, ChangeDetectorRef  } from '@angular/core';
import { trigger, transition, animate } from '@angular/animations';
import { style } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LangService } from 'app/shared/services/lang.service';
import { EventsService } from 'app/shared/services/events.service';
import { InsightsService } from 'app/shared/services/azureInsights.service';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { Clipboard } from "@angular/cdk/clipboard"
import { jsPDFService } from 'app/shared/services/jsPDF.service'
import { jsPDF } from "jspdf";
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
declare var webkitSpeechRecognition: any;
import * as datos from './icons.json';
declare let html2canvas: any;

@Component({
  selector: 'app-land',
  templateUrl: './land-page.component.html',
  styleUrls: ['./land-page.component.scss'],
  providers: [ApiDx29ServerService, jsPDFService, LangService],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }), 
        animate('1s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('testani', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }), 
        animate('1s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})



export class LandPageComponent implements OnInit, OnDestroy  {

  private subscription: Subscription = new Subscription();
  loadedDocs: boolean = false;
  step: number = 1;
  docs: any = [];
  screenWidth: number;
  dataFile: any = {};
  lang: string = 'en';
  originalLang: string = 'en';
  message = '';
  callingOpenai: boolean = false;
  actualStatus: string = '';
  valueProm: any = {};
  tempInput: string = '';
  detectedLang: string = 'en';
  intent: string = '';
  context = [];
  conversation = [];
  submitted: boolean = false;
  @ViewChild('contentSummaryDoc', { static: false }) contentSummaryDoc: TemplateRef<any>;
  modalReference: NgbModalRef;
  actualDoc: any = {};
  totalTokens = 0;
  readonly TOKENS_LIMIT: number = 100000;
  callingSummary: boolean = false;
  summaryPatient: string = '';
  translatedText: string = '';
  selectedLanguage: any = {code:"en",name:"English",nativeName:"English"};
  callingTranslate: boolean = false;
  stepDisclaimer: number = 1;
  myuuid: string = uuidv4();
  paramForm: string = null;
  actualRole: string = '';
  medicalText: string = '';
  summaryDx29: string = '';
  summaryTranscript2: string = '';
  mode: string = '1';
  submode: string = 'opt1';
  recognition: any;
  recording = false;
  supported = false;
  timer: number = 0;
  timerDisplay: string = '00:00';
  private interval: any;
  private audioIntro = new Audio('assets/audio/sonido1.mp4');
  private audioOutro = new Audio('assets/audio/sonido2.mp4');
  stepPhoto = 1;
  capturedImage: any;
  icons: any = (datos as any).default;
  timeline: any = [];
  groupedEvents: any = [];

  startDate: Date;
  endDate: Date;
  selectedEventType: string = null;
  originalEvents: any[]; // Todos los eventos antes de aplicar el filtro
  filteredEvents: any[];
  isOldestFirst = false;
  showFilters = false;
  allLangs: any;

  isEditable = false;
  originalContent: string;
  editedContent: string;
  initialized = false;
  @ViewChild('showPanelEdit') showPanelEdit: TemplateRef<any>;
  @ViewChild('editableDiv') editableDiv: ElementRef;
  langDict = {
    "af": null,
    "sq": null,
    "am": null,
    "ar": null,
    "hy": null,
    "as": null,
    "az": null,
    "bn": null,
    "ba": null,
    "eu": null,
    "bs": null,
    "bg": "BG",
    "yue": null,
    "ca": null,
    "lzh": null,
    "zh-Hans": "ZH",
    "zh-Hant": "ZH",
    "hr": null,
    "cs": "CS",
    "da": "DA",
    "prs": null,
    "dv": null,
    "nl": "NL",
    "en": "EN-US",
    "et": "ET",
    "fo": null,
    "fj": null,
    "fil": null,
    "fi": "FI",
    "fr": "FR",
    "fr-ca": null,
    "gl": null,
    "ka": null,
    "de": "DE",
    "el": "EL",
    "gu": null,
    "ht": null,
    "he": null,
    "hi": null,
    "mww": null,
    "hu": "HU",
    "is": null,
    "id": "ID",
    "ikt": null,
    "iu": null,
    "iu-Latn": null,
    "ga": null,
    "it": "IT",
    "ja": "JA",
    "kn": null,
    "kk": null,
    "km": null,
    "tlh-Latn": null,
    "tlh-Piqd": null,
    "ko": "KO",
    "ku": null,
    "kmr": null,
    "ky": null,
    "lo": null,
    "lv": "LV",
    "lt": "LT",
    "mk": null,
    "mg": null,
    "ms": null,
    "ml": null,
    "mt": null,
    "mi": null,
    "mr": null,
    "mn-Cyrl": null,
    "mn-Mong": null,
    "my": null,
    "ne": null,
    "nb": "NB",
    "or": null,
    "ps": null,
    "fa": null,
    "pl": "PL",
    "pt": "pt-PT",
    "pt-pt": null,
    "pa": null,
    "otq": null,
    "ro": "RO",
    "ru": "RU",
    "sm": null,
    "sr-Cyrl": null,
    "sr-Latn": null,
    "sk": "SK",
    "sl": "SL",
    "so": null,
    "es": "ES",
    "sw": null,
    "sv": "SV",
    "ty": null,
    "ta": null,
    "tt": null,
    "te": null,
    "th": null,
    "bo": null,
    "ti": null,
    "to": null,
    "tr": "TR",
    "tk": null,
    "uk": "UK",
    "hsb": null,
    "ur": null,
    "ug": null,
    "uz": null,
    "vi": null,
    "cy": null,
    "yua": null,
    "zu": null
};


  constructor(private http: HttpClient, public translate: TranslateService, public toastr: ToastrService, private modalService: NgbModal, private apiDx29ServerService: ApiDx29ServerService, private eventsService: EventsService, public insightsService: InsightsService, private clipboard: Clipboard, public jsPDFService: jsPDFService, private ngZone: NgZone, private cdr: ChangeDetectorRef, private langService: LangService) {
    this.screenWidth = window.innerWidth;
    if(sessionStorage.getItem('lang') == null){
      sessionStorage.setItem('lang', this.translate.store.currentLang);
    }
    this.lang = this.translate.store.currentLang;
    this.originalLang = this.translate.store.currentLang;
  }

  async ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.modalService) {
      this.modalService.dismissAll();
    }
  }

  async ngOnInit() {

    this.showDisclaimer();

    this.loadedDocs = true;
    if (this.docs.length == 0) {
      this.step = 1;
    } else {
      this.step = 2;
    }

    this.eventsService.on('changelang', function (lang) {
      (async () => {
        this.lang = lang;
        this.originalLang = lang;
        this.setupRecognition();
      })();
    }.bind(this));

  }

 

  showDisclaimer() {
    console.log(localStorage.getItem('hideDisclaimerlite'))
    if (localStorage.getItem('hideDisclaimerlite') == null || !localStorage.getItem('hideDisclaimerlite')) {
        this.stepDisclaimer = 1;
        document.getElementById("openModalIntro").click();
    }
  }

  showPolicy(){
    this.stepDisclaimer = 2;
    document.getElementById("openModalIntro").click();
    this.scrollTo();
  }

  async scrollTo() {
    await this.delay(200);
    document.getElementById('initcontentIntro').scrollIntoView({ behavior: "smooth" });
}

  showPanelIntro(content) {
    if (this.modalReference != undefined) {
        this.modalReference.close();
    }
    let ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'ModalClass-sm'
    };
    this.modalReference = this.modalService.open(content, ngbModalOptions);
}

nextDisclaimer() {
  this.stepDisclaimer++;
  if (this.stepDisclaimer > 2) {
      this.finishDisclaimer();
  }
}

prevDisclaimer() {
  this.stepDisclaimer--;
}

finishDisclaimer() {
  if (this.modalReference != undefined) {
      this.modalReference.close();
  }
  localStorage.setItem('hideDisclaimerlite', 'true')
}


  selectOpt(opt){
    this.audioIntro.play().catch(error => console.error("Error al reproducir el audio:", error));
    this.mode = '1';
    this.submode= opt;
    this.medicalText = '';
    this.summaryDx29 = '';
    this.setupRecognition();
  }

  backmode0(): void {
    this.audioOutro.play().catch(error => console.error("Error al reproducir el audio:", error));
    this.mode = '1';
    this.submode = 'opt1';
    this.docs = [];
    this.summaryPatient = '';
    this.conversation = [];
    this.context = [];
    this.totalTokens = 0;
    this.callingSummary = false;
    this.medicalText = '';
    this.summaryDx29 = '';
    this.step = 1;
    this.originalContent = '';
    this.editedContent = '';
  }

  setupRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // El navegador soporta la funcionalidad
      console.log('soporta')
      this.recognition = new webkitSpeechRecognition();
      if(this.lang == 'en'){
        this.recognition.lang = 'en-US';
      }else if(this.lang == 'es'){
        this.recognition.lang = 'es-ES';
      }else if(this.lang == 'fr'){
        this.recognition.lang = 'fr-FR';
      }else if(this.lang == 'de'){
        this.recognition.lang = 'de-DE';
      }else if(this.lang == 'it'){
        this.recognition.lang = 'it-IT';
      }else if(this.lang == 'pt'){
        this.recognition.lang = 'pt-PT';
      }
      this.recognition.continuous = true;
      this.recognition.maxAlternatives = 3;
      this.supported = true;
    } else {
      // El navegador no soporta la funcionalidad
      this.supported = false;
      console.log('no soporta')
    }
  }


  startTimer(restartClock) {
    if(restartClock){
      this.timer = 0;
      this.timerDisplay = '00:00';
    }
    this.interval = setInterval(() => {
      this.timer++;
      this.timerDisplay = this.secondsToDisplay(this.timer);
    }, 1000);
  }
  
  stopTimer() {
    clearInterval(this.interval);
    this.timerDisplay = this.secondsToDisplay(this.timer);
  }
  
  secondsToDisplay(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  toggleRecording() {
    if (this.recording) {
      //mosstrar el swal durante dos segundos diciendo que es está procesando
      Swal.fire({
        title: this.translate.instant("voice.Processing audio..."),
        html: this.translate.instant("voice.Please wait a few seconds."),
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false
      })
      //esperar 4 segundos
      console.log('esperando 4 segundos')
      setTimeout(function () {
        console.log('cerrando swal')
        this.stopTimer();
        this.recognition.stop();
        Swal.close();
      }.bind(this), 4000);
      
      this.recording = !this.recording;
      
    } else {
      if(this.medicalText.length > 0){
        //quiere continuar con la grabacion o empezar una nueva
        Swal.fire({
          title: this.translate.instant("voice.Do you want to continue recording?"),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#0CC27E',
          cancelButtonColor: '#FF586B',
          confirmButtonText: this.translate.instant("voice.Yes, I want to continue."),
          cancelButtonText: this.translate.instant("voice.No, I want to start a new recording."),
          showLoaderOnConfirm: true,
          allowOutsideClick: false
        }).then((result) => {
          if (result.value) {
            this.continueRecording(false, true);
          }else{
            this.medicalText = '';
            this.continueRecording(true, true);
          }
        });
      }else{
        this.continueRecording(true, true);
      }
    }
    
  }

  continueRecording(restartClock, changeState){
    this.startTimer(restartClock);
    this.recognition.start();
    this.recognition.onresult = (event) => {
      console.log(event)
      var transcript = event.results[event.resultIndex][0].transcript;
      console.log(transcript); // Utilizar el texto aquí
      //this.medicalText += transcript + '\n';
      this.ngZone.run(() => {
        this.medicalText += transcript + '\n';
      });
      if (event.results[event.resultIndex].isFinal) {
        console.log('ha terminado')
      }
    };

   // this.recognition.onerror = function(event) {
    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        console.log('Reiniciando el reconocimiento de voz...');
        this.restartRecognition(); // Llama a una función para reiniciar el reconocimiento
      } else {
        // Para otros tipos de errores, muestra un mensaje de error
        this.toastr.error('', this.translate.instant("voice.Error in voice recognition."));
      }
    };
    if(changeState){
      this.recording = !this.recording;
    }
  }

  restartRecognition() {
    this.recognition.stop(); // Detiene el reconocimiento actual
    setTimeout(() => this.continueRecording(false, false), 100); // Un breve retraso antes de reiniciar
  }

  restartTranscript(){
    this.medicalText = '';
    this.summaryDx29 = '';
  }

  isSmallScreen(): boolean {
    return this.screenWidth < 576; // Bootstrap's breakpoint for small screen
  }

  onFileDropped(event) {
    for (let file of event) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(file); // read file as data url
      reader.onload = (event2: any) => { // called once readAsDataURL is completed
        var filename = (file).name;
        var extension = filename.substr(filename.lastIndexOf('.'));
        var pos = (filename).lastIndexOf('.')
        pos = pos - 4;
        if (pos > 0 && extension == '.gz') {
          extension = (filename).substr(pos);
        }
        filename = filename.split(extension)[0];
          filename = this.myuuid + '/' + filename + extension;
          this.docs.push({ dataFile: { event: file, name: file.name, url: filename, content: event2.target.result }, langToExtract: '', medicalText: '', state: 'false', tokens: 0 });
        if (file.type == 'application/pdf' || extension == '.docx' || file.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension == '.jpg' || extension == '.png' || extension == '.jpeg' || extension == '.bmp' || extension == '.tiff' || extension == '.heif' || extension == '.pptx') {
          let index = this.docs.length - 1;
          //this.callParser(index);
          this.prepareFile(index);
        } else {
          Swal.fire(this.translate.instant("dashboardpatient.error extension"), '', "error");
        }
      }
    }
  }

  onFileChangePDF(event) {
    for (let file of event.target.files) {
      if (event.target.files && file) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file); // read file as data url
        reader.onload = (event2: any) => { // called once readAsDataURL is completed
          var filename = (file).name;
          var extension = filename.substr(filename.lastIndexOf('.'));
          var pos = (filename).lastIndexOf('.')
          pos = pos - 4;
          if (pos > 0 && extension == '.gz') {
            extension = (filename).substr(pos);
          }
          filename = filename.split(extension)[0];
          filename = this.myuuid + '/' + filename + extension;
          this.docs.push({ dataFile: { event: file, name: file.name, url: filename, content: event2.target.result }, langToExtract: '', medicalText: '', state: 'false', tokens: 0 });
          if (event.target.files[0].type == 'application/pdf' || extension == '.docx' || event.target.files[0].type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension == '.jpg' || extension == '.png' || extension == '.jpeg' || extension == '.bmp' || extension == '.tiff' || extension == '.heif' || extension == '.pptx') {
            let index = this.docs.length - 1;
            this.prepareFile(index);
          } else {
            Swal.fire(this.translate.instant("dashboardpatient.error extension"), '', "error");
          }
        }
      }
    }
  }

  makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += Math.floor(Math.random() * charactersLength);
    }
    return result;
  }

  prepareFile(index) {
    this.docs[index].state = 'uploading';
    const formData = new FormData();
    formData.append("userId", this.myuuid);
    formData.append("thumbnail", this.docs[index].dataFile.event);
    formData.append("url", this.docs[index].dataFile.url);
    formData.append("docId", index);
    this.sendFile(formData, index);
  }

  sendFile(formData, index) {
    this.submitted = true;
    this.subscription.add(this.http.post(environment.api + '/api/upload', formData)
      .subscribe((res: any) => {
        console.log(res)
        if(res.status!=200){
          this.docs[index].state = 'failed';
        }else{
          this.docs[res.doc_id].state = 'done';
          this.docs[res.doc_id].medicalText = res.data;
          this.docs[res.doc_id].summary = res.summary;
          this.docs[res.doc_id].tokens = res.tokens;
          this.totalTokens = this.totalTokens + res.tokens;
          this.submitted = false;
        }
        
      }, (err) => {
        this.docs[index].state = 'failed';
        console.log(err);
        this.insightsService.trackException(err);
        this.submitted = false;
        var msgFail = this.translate.instant("generics.Data saved fail");
          if(err.error.message){
            this.toastr.error(err.error.message, msgFail);
          }else{
            this.toastr.error('', msgFail);
          }
      }));
  }

  deleteDoc(doc, index) {
    Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0CC27E',
      cancelButtonColor: '#FF586B',
      confirmButtonText: this.translate.instant("generics.Delete"),
      cancelButtonText: this.translate.instant("generics.No, cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.confirmDeleteDoc(doc, index);
      }
    });
  }

  confirmDeleteDoc(doc, index) {
    this.totalTokens = this.totalTokens - doc.tokens;
    this.docs.splice(index, 1);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


getBlobUrl(doc){
  let url = URL.createObjectURL(doc.dataFile.event);
  window.open(url);
}

openResults(doc, contentSummaryDoc) {
  console.log(doc)
  this.actualDoc=doc;
  let ngbModalOptions: NgbModalOptions = {
    keyboard: false,
    windowClass: 'ModalClass-sm' // xl, lg, sm
  };
  if (this.modalReference != undefined) {
    this.modalReference.close();
    this.modalReference = undefined;
  }
  this.modalReference = this.modalService.open(contentSummaryDoc, ngbModalOptions);
}

openFileInput(fileInput: any): void {
  fileInput.click();
}

async closeModal() {

  if (this.modalReference != undefined) {
    this.modalReference.close();
    this.modalReference = undefined;
  }
}

madeSummary(role){
  this.timeline = [];
  this.originalEvents = [];
  this.groupedEvents = [];
  this.context = [];
  let nameFiles = [];
    for (let doc of this.docs) {
      if(doc.state == 'done'){
        if(doc.summary){
          this.context.push(doc.summary);
        }else{
          this.context.push(doc.medicalText);
        }

        
        nameFiles.push(doc.dataFile.name);
      }
      if(doc.state == 'uploading'){
        this.toastr.error('', this.translate.instant("demo.No documents to summarize"));
        return;
      }
    }
    
  this.actualRole = role;
  this.callingSummary = true;
  this.summaryPatient = '';

    if(this.context.length == 0){
      this.callingSummary = false;
      this.toastr.error('', this.translate.instant("demo.No documents to summarize"));
      return;
    }
    this.paramForm = this.myuuid+'/results/'+this.makeid(8)
    var query = { "userId": this.myuuid, "context": this.context, "conversation": this.conversation, "role": role, nameFiles: nameFiles, paramForm: this.paramForm };
    this.subscription.add(this.http.post(environment.api + '/api/callsummary/', query)
      .subscribe(async (res: any) => {
        if(res.result1 != undefined){
          res.result1 = res.result1.replace(/^```html\n|\n```$/g, '');
          //res.response = res.response.replace(/\\n\\n/g, '<br>');
          //res.response = res.response.replace(/\n/g, '<br>');
          res.result1 = res.result1.replace(/\\n\\n/g, '');
          res.result1 = res.result1.replace(/\n/g, '');
          this.translateInverseSummary(res.result1).catch(error => {
            console.error('Error al procesar el mensaje:', error);
            this.insightsService.trackException(error);
          });
        }else{
          this.callingSummary = false;
          this.toastr.error('', this.translate.instant("generics.error try again"));
        }
        if(res.result2 != undefined){
          if(res.result2.length > 0){
            this.timeline = JSON.parse(res.result2);
            //this.groupedEvents = this.groupEventsByMonth(this.timeline);
            this.originalEvents = this.timeline;
            this.filterEvents();
          }          
        }
        

      }, (err) => {
        this.callingSummary = false;
        console.log(err);
        this.insightsService.trackException(err);
      }));
}

private groupEventsByMonth(events: any[]): any[] {
  const grouped = {};

  events.forEach(event => {
    const monthYear = this.getMonthYear(event.date).getTime(); // Usar getTime para agrupar
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(event);
  });

  return Object.keys(grouped).map(key => ({
    monthYear: new Date(Number(key)), // Convertir la clave de nuevo a fecha
    events: grouped[key]
  }));
}


private getMonthYear(dateStr: string): Date {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), 1); // Primer día del mes
}


filterEvents() {
  this.cdr.detectChanges();
  console.log(this.originalEvents);
  console.log(this.startDate);
  console.log(this.endDate);

  const startDate = this.startDate ? new Date(this.startDate) : null;
  const endDate = this.endDate ? new Date(this.endDate) : null;

  const filtered = this.originalEvents.filter(event => {
    const eventDate = new Date(event.date);

    const isAfterStartDate = !startDate || eventDate >= startDate;
    const isBeforeEndDate = !endDate || eventDate <= endDate;
    console.log(this.selectedEventType)
    const isEventTypeMatch = !this.selectedEventType || this.selectedEventType=='null' || !event.eventType || event.eventType === this.selectedEventType;
    //const isEventTypeMatch = !this.selectedEventType || event.keyGeneticEvent === this.selectedEventType;


    return isAfterStartDate && isBeforeEndDate && isEventTypeMatch;
  });

  this.groupedEvents = this.groupEventsByMonth(filtered);
  this.orderEvents();
}

resetStartDate() {
  this.startDate = null;
  this.filterEvents();
}
resetEndDate() {
  this.endDate = null;
  this.filterEvents();
}

toggleEventOrder() {
  this.isOldestFirst = !this.isOldestFirst; // Cambia el estado del orden
  this.orderEvents();
}

orderEvents() {
  this.groupedEvents.sort((a, b) => {
    const dateA = a.monthYear.getTime(); // Convertir a timestamp
    const dateB = b.monthYear.getTime(); // Convertir a timestamp
    return this.isOldestFirst ? dateA - dateB : dateB - dateA;
  });

  this.groupedEvents.forEach(group => {
    group.events.sort((a, b) => {
      const dateA = new Date(a.date).getTime(); // Convertir a timestamp
      const dateB = new Date(b.date).getTime(); // Convertir a timestamp
      return this.isOldestFirst ? dateA - dateB : dateB - dateA;
    });
  });
  console.log(this.groupedEvents)
}

async translateInverseSummary(msg): Promise<string> {
  return new Promise((resolve, reject) => {
    // Función auxiliar para procesar el contenido de la tabla
    const processTable = (tableContent) => {
      return tableContent.replace(/\n/g, ''); // Eliminar saltos de línea dentro de la tabla
    };

    // Función auxiliar para procesar el texto fuera de las tablas
    const processNonTableContent = (text) => {
      return text.replace(/\\n\\n/g, '<br>').replace(/\n/g, '<br>');
    };

    if (this.lang != 'en') {
      var jsontestLangText = [{ "Text": msg }]
      this.subscription.add(this.apiDx29ServerService.getDeepLTranslationInvert(this.lang, jsontestLangText)
        .subscribe((res2: any) => {
          if (res2.text != undefined) {
            msg = res2.text;
          }
          
          // Aquí procesamos el mensaje
          const parts = msg.split(/(<table>|<\/table>)/); // Divide el mensaje en partes de tabla y no tabla
          this.summaryPatient = parts.map((part, index) => {
            if (index % 4 === 2) { // Los segmentos de tabla estarán en las posiciones 2, 6, 10, etc. (cada 4 desde el segundo)
              return processTable(part);
            } else {
              return processNonTableContent(part);
            }
          }).join('');

          this.callingSummary = false;
          resolve('ok');
        }, (err) => {
          console.log(err);
          this.insightsService.trackException(err);
          this.summaryPatient = processNonTableContent(msg);
          this.callingSummary = false;
          resolve('ok');
        }));
    } else {
      this.summaryPatient = processNonTableContent(msg);
      this.callingSummary = false;
      resolve('ok');
    }
  });
}

          //this.summaryPatient= '<div><h3>ملخص المعلومات الجينية</h3><p>المعلومات الجينية التي قمت بتحميلها تشكل تقريراً جينياً وتساعد في شرح الأسباب الجينية المحتملة لحالتك الصحية.</p><p>المريض: خوان بيريز</p><p>يحدد هذا التقرير الطفرات الجينية الخاصة التي قد تكون مرتبطة بمرضك، وهو مرض عضلة القلب. إليك ملخص لأهم النتائج:</p><ul><li><strong>الجين TTN:</strong> طفرة حذف (c.80248_80251del) مصنفة كمرضية. تؤثر هذه الطفرة على وظيفة الجين، مما يؤدي إلى بروتين مقطوع. الطفرات في TTN مرتبطة بمرض عضلة القلب المتوسع السائد الوراثي.</li><li><strong>الجين MYH7:</strong> طفرة بلا معنى (c.742G&gt;A) مصنفة كمحتملة الضرر. تؤثر هذه الطفرة على جزء حيوي من الجين، وهو مهم لوظيفة عضلة القلب. الطفرات في MYH7 مرتبطة بأشكال مختلفة من أمراض عضلة القلب.</li><li><strong>الجين LMNA:</strong> طفرة بلا معنى (c.1588C&gt;T) ذات معنى غير مؤكد. تقع هذه الطفرة في منطقة حاسمة من الجين، والتي تلعب دوراً في الحفاظ على بنية نواة الخلية. قد تسبب الطفرات في LMNA أمراض عضلة القلب والضمور العضلي، لكن التأثير الدقيق لهذه الطفرة المحددة لا يزال غير واضح.</li></ul><p><strong>توصيات أخرى:</strong></p><ul><li>التقييم السريري: يُوصى بإجراء تقييم سريري مفصل لأفراد عائلتك لتحديد الحاملين المحتملين لهذه الطفرات الجينية.</li><li>الاستشارة الجينية: يُقترح أن تتلقى أنت وعائلتك استشارة جينية لمناقشة هذه النتائج وتداعياتها.</li><li>المتابعة الطبية: يُنصح بمتابعة منتظمة مع أخصائي أمراض القلب المتخصص في الأمراض الجينية.</li></ul><p>تهدف هذه المعلومات إلى مساعدتك على فهم حالتك الجينية بشكل أفضل وتسهيل المحادثات المستنيرة مع مقدمي الرعاية الصحية الخاصين بك.</p></div><output>{ "تقنية_جينية": "الإكسوم", "الطفرات_المرضية": true, "قائمة_الطفرات_المرضية": [ {"طفرة": "c.80248_80251del", "تاريخ": "2024-05-10"} ], "التراث_الجيني": "السائد الوراثي الجسمي", "تأكيد_الاختبارات_الأبوية": false}</output>'
          async download(){
            let questionnaire = 'ah7rg7N8';
            if(this.lang == 'es'){
              questionnaire = 'z6hgZFGs';
            }
            let url = 'https://davlv9v24on.typeform.com/to/'+questionnaire+'#uuid='+this.paramForm+'&role='+this.actualRole+'&mode='+this.submode
            const qrCodeDataURL = await QRCode.toDataURL(url);
            console.log(this.summaryPatient)
            let tempSumary = this.summaryPatient.replace(/<br\s*\/?>/gi, '').replace(/\s{2,}/g, ' ');
            this.jsPDFService.generateResultsPDF2(tempSumary, this.translate.store.currentLang, qrCodeDataURL)
            /* let htmldemo={"text":"<div><br>  <h3>Resumen médico</h3><br>  <p>Los documentos que acaba de cargar son historiales médicos y ayudan a explicar su historial de salud, su estado actual y los tratamientos en curso. Este resumen está diseñado para ofrecerle una comprensión clara de su situación médica.</p><br>  <h4>Presentación del paciente</h4><br>  <p>El paciente es Sergio Isla Miranda, un varón de 14 años con un historial de afecciones médicas complejas, principalmente de naturaleza neurológica.</p><br>  <h4>Diagnósticos</h4><br>  <ul><br>    <li><strong>Epilepsia:</strong> Sergio padece epilepsia refractaria, concretamente Síndrome de Dravet, que es una forma grave de epilepsia de difícil tratamiento.</li><br>    <li><strong>Trastornos del desarrollo:</strong> Tiene un trastorno generalizado del desarrollo y un trastorno grave del lenguaje expresivo y comprensivo.</li><br>    <li><strong>Condiciones físicas:</strong> Sergio también tiene los pies muy arqueados (pies cavos), anemia ferropénica y una curvatura de la columna vertebral (escoliosis dorsolumbar).</li><br>  </ul><br>  <h4>Tratamiento y medicación</h4><br>  <ul><br>    <li><strong>Medicación:</strong> Sergio toma varios medicamentos, entre ellos Diacomit, Depakine, Noiafren y Fenfluramina para controlar su epilepsia.</li><br>    <li><strong>Suplementos:</strong> También toma suplementos de hierro para tratar su anemia.</li><br>    <li><strong>Terapias:</strong> Participa en fisioterapia, logopedia y educación física adaptada para favorecer su desarrollo y su salud física.</li><br>  </ul><br>  <h4>Otros</h4><br>  <ul><br>    <li>Sergio ha sufrido estados epilépticos, que son ataques prolongados que requieren atención médica inmediata.</li><br>    <li>Tiene una mutación en el gen SCN1A, que está asociada a su epilepsia.</li><br>    <li>Su plan de tratamiento se sigue de cerca y se ajusta según sea necesario para controlar su enfermedad.</li><br>    <li>Sergio requiere atención y seguimiento continuos debido a la gravedad de su epilepsia, que puede incluir emergencias potencialmente mortales como una parada cardiaca.</li><br>  </ul><br>  <p>Es importante que Sergio y sus cuidadores mantengan una comunicación abierta con los profesionales sanitarios para garantizar el mejor tratamiento posible de su enfermedad.</p><br></div>"};
            htmldemo.text = htmldemo.text.replace(/<br\s*\/?>/gi, '').replace(/\s{2,}/g, ' ');
            this.jsPDFService.generateResultsPDF(htmldemo.text, this.translate.store.currentLang, qrCodeDataURL)*/
          }

          async download2(){
            let questionnaire = 'ah7rg7N8';
            let url = 'https://davlv9v24on.typeform.com/to/'+questionnaire+'#uuid='+this.paramForm+'&role='+this.actualRole+'&mode='+this.submode
            const qrCodeDataURL = await QRCode.toDataURL(url);
            console.log(this.translatedText)
            /*let tempSumary = this.translatedText.replace(/<br\s*\/?>/gi, '').replace(/\s{2,}/g, ' ');*/
            const nonLatinLanguages = [
              "am", "ar", "hy", "as", "av", "ba", "be", "bn", "bg", "my", "zh-CN", "cv", "ce", "ka", 
              "el", "gu", "he", "hi", "ja", "kn", "kk", "km", "ko", "ky", "lo", "mk", "ml", "mn", 
              "ne", "or", "pa", "fa", "ps", "ru", "sa", "si", "sd", "ta", "te", "th", "bo", "tk", 
              "ug", "uk", "ur", "uz", "vi", "yi"
          ];
      
          if (nonLatinLanguages.includes(this.selectedLanguage.code)) {
              await this.jsPDFService.generateResultsPDF(this.translatedText, this.translate.store.currentLang, qrCodeDataURL);
          } else {
              await this.jsPDFService.generateResultsPDF2(this.translatedText, this.translate.store.currentLang, qrCodeDataURL);
          }
            /* let htmldemo={"text":"<div><br>  <h3>Resumen médico</h3><br>  <p>Los documentos que acaba de cargar son historiales médicos y ayudan a explicar su historial de salud, su estado actual y los tratamientos en curso. Este resumen está diseñado para ofrecerle una comprensión clara de su situación médica.</p><br>  <h4>Presentación del paciente</h4><br>  <p>El paciente es Sergio Isla Miranda, un varón de 14 años con un historial de afecciones médicas complejas, principalmente de naturaleza neurológica.</p><br>  <h4>Diagnósticos</h4><br>  <ul><br>    <li><strong>Epilepsia:</strong> Sergio padece epilepsia refractaria, concretamente Síndrome de Dravet, que es una forma grave de epilepsia de difícil tratamiento.</li><br>    <li><strong>Trastornos del desarrollo:</strong> Tiene un trastorno generalizado del desarrollo y un trastorno grave del lenguaje expresivo y comprensivo.</li><br>    <li><strong>Condiciones físicas:</strong> Sergio también tiene los pies muy arqueados (pies cavos), anemia ferropénica y una curvatura de la columna vertebral (escoliosis dorsolumbar).</li><br>  </ul><br>  <h4>Tratamiento y medicación</h4><br>  <ul><br>    <li><strong>Medicación:</strong> Sergio toma varios medicamentos, entre ellos Diacomit, Depakine, Noiafren y Fenfluramina para controlar su epilepsia.</li><br>    <li><strong>Suplementos:</strong> También toma suplementos de hierro para tratar su anemia.</li><br>    <li><strong>Terapias:</strong> Participa en fisioterapia, logopedia y educación física adaptada para favorecer su desarrollo y su salud física.</li><br>  </ul><br>  <h4>Otros</h4><br>  <ul><br>    <li>Sergio ha sufrido estados epilépticos, que son ataques prolongados que requieren atención médica inmediata.</li><br>    <li>Tiene una mutación en el gen SCN1A, que está asociada a su epilepsia.</li><br>    <li>Su plan de tratamiento se sigue de cerca y se ajusta según sea necesario para controlar su enfermedad.</li><br>    <li>Sergio requiere atención y seguimiento continuos debido a la gravedad de su epilepsia, que puede incluir emergencias potencialmente mortales como una parada cardiaca.</li><br>  </ul><br>  <p>Es importante que Sergio y sus cuidadores mantengan una comunicación abierta con los profesionales sanitarios para garantizar el mejor tratamiento posible de su enfermedad.</p><br></div>"};
            htmldemo.text = htmldemo.text.replace(/<br\s*\/?>/gi, '').replace(/\s{2,}/g, ' ');
            this.jsPDFService.generateResultsPDF(htmldemo.text, this.translate.store.currentLang, qrCodeDataURL)*/
          }

          openFeedback(){
            let url = 'https://surveys.hotjar.com/8c45b969-6087-4b58-82f3-cc496b881117'
            window.open(url, "_blank");
          }

          newSummary(){
            this.summaryPatient = '';
          }

          getLiteral(literal) {
            return this.translate.instant(literal);
        }

        showPanelMedium(content) {
          this.medicalText = '';
          this.summaryDx29 = '';
          if (this.modalReference != undefined) {
              this.modalReference.close();
          }
          let ngbModalOptions: NgbModalOptions = {
              backdrop: 'static',
              keyboard: false,
              windowClass: 'ModalClass-lg'
          };
          this.modalReference = this.modalService.open(content, ngbModalOptions);
      }

          removeHtmlTags(html) {
            // Crear un elemento div temporal
            var tempDivElement = document.createElement("div");
            // Asignar el HTML al div
            tempDivElement.innerHTML = html;
            // Usar textContent para obtener el texto plano
            return tempDivElement.textContent || tempDivElement.innerText || "";
        }

        convertHtmlToPlainText(html) {
          // Reemplazar etiquetas <br> y </div> con saltos de línea
          let text = html.replace(/<br\s*[\/]?>/gi, "\n").replace(/<\/div>/gi, "\n");
      
          // Crear un elemento div temporal para manejar cualquier otra etiqueta HTML
          var tempDivElement = document.createElement("div");
          tempDivElement.innerHTML = text;
      
          // Obtener texto plano
          return tempDivElement.textContent || tempDivElement.innerText || "";
      }

        async entryOpt(opt, content){
          if(opt=='opt1'){
            this.stepPhoto = 1;
            let ngbModalOptions: NgbModalOptions = {
              keyboard: false,
              windowClass: 'ModalClass-sm' // xl, lg, sm
            };
            if (this.modalReference != undefined) {
              this.modalReference.close();
              this.modalReference = undefined;
            }
            this.modalReference = this.modalService.open(content, ngbModalOptions);
            await this.delay(200);
            this.openCamera();
          }
        }

        isMobileDevice(): boolean {
          const userAgent = navigator.userAgent || navigator.vendor;
          return /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
        }

        openCamera() {
          const videoElement = document.querySelector('#videoElement') as HTMLVideoElement;
          if (videoElement) {
            let params = {
              video: {
                facingMode: 'user'
              }
            }
            if (this.isMobileDevice()) {
              params = {
                video: {
                  facingMode: 'environment'
                }
              }
            }
            navigator.mediaDevices.getUserMedia(params)
              .then(stream => {
                videoElement.srcObject = stream;
              })
              .catch(err => {
                console.error("Error accessing camera:", err);
                //debe permitir la camara para continuar
                this.toastr.error('', 'You must allow the camera to continue. Please enable camera access in your browser settings and try again.');
                if (this.modalReference != undefined) {
                  this.modalReference.close();
                  this.modalReference = undefined;
                }
              });
          } else {
            console.error("Video element not found");
            this.toastr.error('', this.translate.instant("generics.error try again"));
          }
        }

        captureImage() {
          const videoElement = document.querySelector('#videoElement') as HTMLVideoElement;
          if (videoElement) {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
            this.capturedImage = canvas.toDataURL('image/png');
            this.stopCamera();
            this.stepPhoto = 2;
          } else {
            console.error("Video element not ready for capture.");
          }
        }

        stopCamera() {
          const videoElement = document.querySelector('#videoElement') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const tracks = stream.getTracks();
        
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
          }
        }

        async prevCamera(){
          this.stepPhoto = 1;
          await this.delay(200);
          this.openCamera();
          this.capturedImage = '';
        }

        finishPhoto(){
          if (this.modalReference != undefined) {
            this.modalReference.close();
            this.modalReference = undefined;
          }
          //add file to docs
          let file = this.dataURLtoFile(this.capturedImage, 'photo.png');
          var reader = new FileReader();
          reader.readAsArrayBuffer(file); // read file as data url
          this.docs.push({ dataFile: { event: file, name: file.name, url: file.name, content: this.capturedImage }, langToExtract: '', medicalText: '', state: 'false', tokens: 0 });
          let index = this.docs.length - 1;
          this.prepareFile(index);
        }

        //create dataURLtoFile
        dataURLtoFile(dataurl, filename) {
          var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, {type:mime});
        }

        createFile(){
          //from this.medicalText create a txt file and add to docs
          //est the name with the date
          let today = new Date();
          let dd = today.getDate();
          let mm = today.getMonth()+1;
          let yyyy = today.getFullYear();
          let hh = today.getHours();
          let min = today.getMinutes();
          let sec = today.getSeconds();
          let ms = today.getMilliseconds();
          let date = dd+mm+yyyy+hh+min+sec+ms;
          let fileName = 'manualFile-'+date+'.txt';
          if(this.lang == 'es'){
            fileName = 'informeManual-'+date+'.txt';
          }
          
          let file = new File([this.medicalText], fileName, {type: 'text/plain'});
          var reader = new FileReader();
          reader.readAsArrayBuffer(file); // read file as data url
          this.docs.push({ dataFile: { event: file, name: file.name, url: file.name, content: this.medicalText }, langToExtract: '', medicalText: this.medicalText, state: 'done', tokens: 0 });
          if (this.modalReference != undefined) {
            this.modalReference.close();
            this.modalReference = undefined;
          }
        }

        toggleFilters() {
          this.showFilters = !this.showFilters;
        }

        useSampleText() {
          
          this.medicalText = `Paciente: Juan Pérez
            Fecha de nacimiento: 15/03/1980
            ID del Paciente: JP19800315

            1. Antecedentes Clínicos:
            El paciente presenta un historial de cardiomiopatía dilatada (CMD) y antecedentes familiares de miocardiopatías y arritmias. Se ha observado una progresión de los síntomas, incluyendo fatiga, disnea y episodios de síncope.

            2. Objetivo del Estudio:
            Identificar variantes genéticas potencialmente patogénicas que puedan estar relacionadas con la condición clínica del paciente, enfocándose en genes asociados con cardiomiopatías.

            3. Metodología:
            Se realizó una secuenciación completa del exoma (WES) utilizando la plataforma de secuenciación de nueva generación (NGS). Los datos obtenidos fueron analizados para identificar variantes en genes relacionados con cardiomiopatías, utilizando bases de datos de referencia y herramientas bioinformáticas para predecir la patogenicidad de las variantes encontradas.

            4. Resultados:

            A. Variantes Identificadas:

            Gen TTN:
            - Variante: c.80248_80251del (p.Ser26750Cysfs*12)
            - Tipo: Deleción de nucleótidos
            - Clasificación: Patogénica
            - Descripción: Esta variante causa una interrupción en la lectura del marco del gen TTN, resultando en una proteína truncada. Las mutaciones en TTN están asociadas con cardiomiopatía dilatada autosómica dominante.

            Gen MYH7:
            - Variante: c.742G>A (p.Arg248His)
            - Tipo: Cambio de sentido
            - Clasificación: Probablemente patogénica
            - Descripción: Esta variante missense afecta un residuo altamente conservado en la cabeza de la cadena pesada de la miosina beta-cardiaca. Las mutaciones en MYH7 están implicadas en diversas formas de miocardiopatía.

            Gen LMNA:
            - Variante: c.1588C>T (p.Arg530Cys)
            - Tipo: Cambio de sentido
            - Clasificación: De significancia incierta
            - Descripción: Esta variante se encuentra en una región crítica del gen LMNA, que codifica la proteína lamin A/C. Las mutaciones en LMNA pueden causar una variedad de enfermedades, incluyendo cardiomiopatías y distrofias musculares. Sin embargo, la patogenicidad exacta de esta variante específica aún no está claramente establecida.

            5. Conclusiones:
            Las variantes patogénicas identificadas en los genes TTN y MYH7 son probablemente responsables de la cardiomiopatía dilatada observada en el paciente. La variante en LMNA requiere más investigación para determinar su relevancia clínica.

            6. Recomendaciones:
            - Evaluación Clínica: Se recomienda una evaluación clínica detallada de los familiares del paciente para identificar posibles portadores de las variantes patogénicas.
            - Consejería Genética: Se sugiere que el paciente y sus familiares reciban consejería genética para discutir los resultados y sus implicaciones.
            - Seguimiento Médico: Se aconseja un seguimiento regular con un cardiólogo especializado en enfermedades genéticas.

            Firmado por:
            Dr. Ana Gómez, Genetista
            Fecha: 10/05/2024`;
        }

        showPanelTranslate(content) {
          if (this.modalReference != undefined) {
              this.modalReference.close();
          }
          this.loadAllLanguages();
          let ngbModalOptions: NgbModalOptions = {
              backdrop: 'static',
              keyboard: false,
              windowClass: 'ModalClass-xl'// xl, lg, sm
          };
          this.modalReference = this.modalService.open(content, ngbModalOptions);
      }

      loadAllLanguages() {
        this.allLangs = [];
        this.subscription.add( this.langService.getAllLangs()
        .subscribe( (res : any) => {
          console.log(res)
          this.allLangs=res;
        }));
    }

    async translateText(){
      if(this.summaryPatient == ''){
        this.toastr.error('', this.translate.instant("demo.No text to translate"));
        return;
      }
      this.callingTranslate = true;
      var deepl_code = await this.getDeeplCode(this.selectedLanguage.code);
      if (deepl_code == null) {
        var testLangText = this.summaryPatient .substr(0, 4000)
        this.subscription.add(this.apiDx29ServerService.getDetectLanguage(testLangText)
        .subscribe((res: any) => {
          let jsontestLangText = [{ "Text": this.summaryPatient }]
          this.subscription.add(this.apiDx29ServerService.getTranslationSegmentsInvert(res[0].language, this.selectedLanguage.code,jsontestLangText)
          .subscribe( (res2 : any) => {
              
              if (res2[0] != undefined) {
                  if (res2[0].translations[0] != undefined) {
                      res2[0].translations[0].text = res2[0].translations[0].text.replace(/^```html\n|\n```$/g, '');
                      res2[0].translations[0].text = res2[0].translations[0].text.replace(/\\n\\n/g, '');
                      res2[0].translations[0].text = res2[0].translations[0].text.replace(/\n/g, '');
                    this.translatedText = res2[0].translations[0].text;
                  }else{
                    console.log(res2)
                    //mostrar en un swal que no se pudo traducir, The target language is not valid. que pruebe con la opcion de traducir con IA
                    Swal.fire({
                      icon: 'error',
                      title: this.translate.instant("demo.The target language is not valid. Try the option to translate with AI."),
                      showCancelButton: false,
                      showConfirmButton: true,
                      allowOutsideClick: false
                   })

                  }
              }else{
                console.log(res2)
                Swal.fire({
                  icon: 'error',
                  title: this.translate.instant("demo.The target language is not valid. Try the option to translate with AI."),
                  showCancelButton: false,
                  showConfirmButton: true,
                  allowOutsideClick: false
               })
              }
              this.callingTranslate = false;
    
          }, (err) => {
            console.log(err);
            this.insightsService.trackException(err);
            this.callingTranslate = false;
          }));
        }, (err) => {
          this.insightsService.trackException(err);
          console.log(err);
          this.callingTranslate = false;
      }));
      }else{
        var jsontestLangText = [{ "Text": this.summaryPatient  }]
        this.subscription.add(this.apiDx29ServerService.getDeepLTranslationInvert(this.selectedLanguage.code, jsontestLangText )
        .subscribe((res2: any) => {
          console.log(res2)
          if (res2.text != undefined) {
            res2.text = res2.text.replace(/^```html\n|\n```$/g, '');
            res2.text = res2.text.replace(/\\n\\n/g, '');
            res2.text = res2.text.replace(/\n/g, '');
            this.translatedText = res2.text;
          }
          this.callingTranslate = false;
        }, (err) => {
          console.log(err);
          this.insightsService.trackException(err);
          this.callingTranslate = false;
        }));
      }
     
    }

    async translateTextIA(){
      if(this.summaryPatient == ''){
        this.toastr.error('', this.translate.instant("demo.No text to translate"));
        return;
      }
      this.callingTranslate = true;

      this.subscription.add(this.apiDx29ServerService.getIATranslation(this.selectedLanguage.name, this.summaryPatient )
        .subscribe((res2: any) => {
          if (res2.text != undefined) {
            res2.text = res2.text.replace(/^```html\n|\n```$/g, '');
            res2.text = res2.text.replace(/\\n\\n/g, '');
            res2.text = res2.text.replace(/\n/g, '');
            this.translatedText = res2.text;
          }
          this.callingTranslate = false;
        }, (err) => {
          console.log(err);
          this.insightsService.trackException(err);
          this.callingTranslate = false;
        }));
     
    }

    getDeeplCode(msCode) {
      return this.langDict[msCode] || null;
    }

    changeLanguage(){
      this.translatedText = '';
    }
        

    async closeModalTranslate() {
      this.translatedText = '';
      this.selectedLanguage = {"code":"en","name":"English","nativeName":"English"};
      if (this.modalReference != undefined) {
        this.modalReference.close();
        this.modalReference = undefined;
      }
    }


    async toggleEdit(content: TemplateRef<any>) {
      this.originalContent = this.summaryPatient;
      this.editedContent = this.summaryPatient; 
  
      let ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'ModalClass-xl' // xl, lg, sm
      };
  
      this.modalReference = this.modalService.open(content, ngbModalOptions);
      await this.delay(500);
      setTimeout(() => {
        const modalElement = document.getElementById('editableDiv');
        if (modalElement) {
          this.editableDiv = new ElementRef(modalElement);
        }
      }, 0);

  

    }
  
    saveChanges(modal) {
      if (this.editableDiv && this.editableDiv.nativeElement) {
        this.summaryPatient = this.editableDiv.nativeElement.innerHTML;
      }
      modal.close();
    }
  
    cancelChanges(modal) {
      this.editedContent = this.originalContent;
      modal.close();
    }
}
