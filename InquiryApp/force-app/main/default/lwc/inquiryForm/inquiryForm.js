import { LightningElement, track } from 'lwc';
import createInquiry from '@salesforce/apex/InquiryController.createInquiry';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // トーストメッセージ用

export default class InquiryForm extends LightningElement {
    @track name = '';
    @track email = '';
    @track description = '';
    @track errors = {}; // 入力エラーを管理
    @track isLoading = false; // 送信中のスピナー表示

    // 入力フィールド変更時の処理
    handleInputChange(event) {
        const field = event.target.name; // inputのname属性からフィールドを識別
        this[field] = event.target.value;
        this.validateField(field);
    }

    // フィールド単体のバリデーション
    validateField(field) {
        this.errors[field] = '';
        if (field === 'name' && this.name.trim() === '') {
            this.errors[field] = '名前を入力してください';
        }
        if (field === 'email' && !this.email.includes('@')) {
            this.errors[field] = '有効なメールアドレスを入力してください';
        }
        if (field === 'description' && this.description.trim() === '') {
            this.errors[field] = '問い合わせ内容を入力してください';
        }
    }

    // フォーム全体のバリデーション
    validateForm() {
        this.validateField('name');
        this.validateField('email');
        this.validateField('description');
        return Object.values(this.errors).every((error) => error === '');
    }

    // 送信ボタン処理
    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true; // スピナーを表示

        try {
            await createInquiry({
                name: this.name,
                email: this.email,
                description: this.description,
            });
            this.clearForm();
            this.showToast('成功', '問い合わせを送信しました', 'success');
        } catch (error) {
            console.error(error);
            this.showToast('エラー', '問い合わせの送信中にエラーが発生しました', 'error');
        } finally {
            this.isLoading = false; // スピナーを非表示
        }
    }

    // フォームリセット
    clearForm() {
        this.name = '';
        this.email = '';
        this.description = '';
        this.errors = {};
    }

    // トースト通知を表示
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}
