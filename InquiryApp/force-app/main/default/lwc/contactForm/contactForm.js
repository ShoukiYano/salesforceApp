import { LightningElement, track } from 'lwc';

import getGreeting from '@salesforce/apex/contactController.getGreeting';

export default class ContactForm extends LightningElement {
    @track name = '';
    @track greeting = '';
    
    name = 'World';

    handleChange(event) {
        this.name = event.target.value;
    }

    async fetchGreeting() {
        this.greeting = await getGreeting({ name: this.name});
    } catch(error) {
        console.log(error);        
    }


}