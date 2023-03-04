import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingController } from '@ionic/angular';  
import { AlertController } from '@ionic/angular';  

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  latitude: any;
  longitude: any;


  constructor(public loadingController: LoadingController, public alertController: AlertController) {
    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    const loading = await this.loadingController.create({
      message: 'Porfavor espera...'
    });
    await loading.present();
    Geolocation.getCurrentPosition( { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true } ).then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      loading.dismiss();
      this.presentAlert('Localizacion obtenida')
    }).catch((error) => {
      console.log('Error al obtener la ubicación', error);
      loading.dismiss();
      this.presentAlert('Sin señal GPS' + JSON.stringify(error))
    });
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

}
