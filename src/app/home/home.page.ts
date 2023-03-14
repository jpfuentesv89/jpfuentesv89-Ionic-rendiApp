import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  ticket = {
    cliente: {
      rut: '',
      nombre: '',
      direccion: '',
      comuna: '',
      telefono: ''
    },
    fecha: '',
    hora: '',
    kilometraje: '',
    atencion: {
      pos: '',
      tipo: '',
      serieAtendida: '',
      serieSaliente: '',
      serieEntrante: '',
      descripcion: '',
      observaciones: ''
    },
    gps: {
      longitud: 0,
      latitud: 0
    },
    foto: ''
  }

  data: any;

  constructor(public loadingController: LoadingController, public alertController: AlertController, private barcodeScanner: BarcodeScanner) {

    this.guardarUbicacion('');

  }

  ngOnInit() {
  }

  async scanCode() {
    const loading = await this.loadingController.create({
      message: 'Porfavor espera...'
    });
    await loading.present();
    this.barcodeScanner.scan().then(barcodeData => {
      this.data = barcodeData.text;
      console.log('Barcode data', barcodeData);
      this.presentAlert('Código escaneado con éxito' + this.data);
      loading.dismiss();
    }).catch(err => {
      console.log('Error', err);
      loading.dismiss();
    });
  }

  combustibleParada() {
    this.guardarUbicacion('como parada de combustible');
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async guardarUbicacion(msg: string) {
    const loading = await this.loadingController.create({
      message: 'Porfavor espera...'
    });
    await loading.present();
    Geolocation.getCurrentPosition({ maximumAge: 1000, timeout: 10000, enableHighAccuracy: true }).then((resp) => {
      this.ticket.gps.latitud = resp.coords.latitude;
      this.ticket.gps.longitud = resp.coords.longitude;
      console.log(this.ticket.gps.latitud + ' ---> ' + this.ticket.gps.longitud)
      console.log('Ubicación encontrada y guardada ');
      loading.dismiss();
      if (msg != '') {
        this.presentAlert('Ubicación guardada ' + msg + ' con éxito');
      }
    }).catch((error) => {
      console.log('Error al obtener la ubicación', error);
      loading.dismiss();
      this.presentAlert('Sin cobertura GPS o GPS desactivado, favor revisar');
    });
  }

  async selectFile(event: any) {
    const loading = await this.loadingController.create({
      message: 'Porfavor espera...'
    });
    await loading.present();
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      console.log(reader.result);
      this.data = reader.result?.toString().replace(/(\r\n|\n|\r)/gm, ';').split(';');
      for (let index = 0; index < this.data.length;) {
        this.ticket.atencion.pos = this.data[index + 6];
        this.ticket.cliente.rut = this.data[index + 3];
        this.ticket.cliente.nombre = this.data[index];
        this.ticket.cliente.direccion = this.data[index + 1];
        this.ticket.cliente.comuna = this.data[index + 2];
        this.ticket.cliente.telefono = 'Sin telefono';
        this.ticket.atencion.serieEntrante = this.data[index + 5];
        index += 7;
        console.log(this.ticket);
      }

      loading.dismiss();
    };
    reader.onerror = () => {
      console.log('ocurrio un error al leer el archivo');
      loading.dismiss();
    };
  }

}
