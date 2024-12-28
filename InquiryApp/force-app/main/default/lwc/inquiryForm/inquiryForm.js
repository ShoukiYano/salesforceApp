// LWCモジュールから必要なクラスと関数をインポートします
import { LightningElement, track } from 'lwc'; 
// Apexメソッドを呼び出すためにInquiryControllerクラスのcreateInquiryメソッドをインポートします
import createInquiry from '@salesforce/apex/InquiryController.createInquiry';
// トーストメッセージを表示するためのLightning Platformモジュールをインポートします
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// LWCコンポーネントを定義
export default class InquiryForm extends LightningElement {
    // 入力された名前を保存するプロパティ
    @track name = ''; 
    // 入力されたメールアドレスを保存するプロパティ
    @track email = ''; 
    // 入力された電話番号を保存するプロパティ
    @track phone = ''; 
    // 選択されたカテゴリを保存するプロパティ
    @track category = ''; 
    // 選択された優先度を保存するプロパティ
    @track priority = ''; 
    // 問い合わせ内容を保存するプロパティ
    @track description = ''; 
    // アップロードされた添付ファイル名を保存するプロパティ
    @track attachment; 
    // 現在の日時を保存するプロパティ
    @track inquiryDate = new Date().toISOString(); 
    // 入力エラーを管理するオブジェクト
    @track errors = {}; 
    // ローディング状態を管理するフラグ
    @track isLoading = false; 

    // 入力フィールドの値が変更されたときに呼び出されるイベントハンドラー
    handleInputChange(event) {
        const field = event.target.name; // 入力フィールドのname属性からフィールド名を取得
        this[field] = event.target.value; // 対応するプロパティに値を設定
        this.validateField(field); // バリデーションを実行
    }

    // フィールド単体のバリデーションを実行
    validateField(field) {
        this.errors[field] = ''; // エラーメッセージを初期化
        // 名前が空の場合にエラーを設定
        if (field === 'name' && this.name.trim() === '') {
            this.errors[field] = '名前を入力してください';
        }
        // メールアドレスが不正な場合にエラーを設定
        if (field === 'email' && !this.email.includes('@')) {
            this.errors[field] = '有効なメールアドレスを入力してください';
        }
        // 電話番号が不正な場合にエラーを設定
        if (field === 'phone' && !/^\d{10,15}$/.test(this.phone)) {
            this.errors[field] = '有効な電話番号を入力してください';
        }
        // 問い合わせ内容が空の場合にエラーを設定
        if (field === 'description' && this.description.trim() === '') {
            this.errors[field] = '問い合わせ内容を入力してください';
        }
    }

    // フォーム全体のバリデーションを実行
    validateForm() {
        this.validateField('name'); // 名前フィールドのバリデーション
        this.validateField('email'); // メールフィールドのバリデーション
        this.validateField('phone'); // 電話番号フィールドのバリデーション
        this.validateField('description'); // 問い合わせ内容フィールドのバリデーション
        // すべてのエラーが空である場合にtrueを返す
        return Object.values(this.errors).every((error) => error === '');
    }

    // ファイルアップロードイベントハンドラー
    handleFileChange(event) {
        const file = event.target.files[0]; // アップロードされたファイルを取得
        this.attachment = file ? file.name : null; // ファイル名をattachmentプロパティに設定
    }

    // フォーム送信時に実行されるメソッド
    async handleSubmit() {
        // バリデーションに失敗した場合は処理を中断
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true; // ローディング状態を開始

        try {
            // Apexメソッドを呼び出して問い合わせを作成
            await createInquiry({
                name: this.name,
                email: this.email,
                phone: this.phone,
                category: this.category,
                priority: this.priority,
                description: this.description,
                attachment: this.attachment,
                inquiryDate: this.inquiryDate
            });
            this.clearForm(); // フォームをリセット
            this.showToast('成功', '問い合わせを送信しました', 'success'); // 成功メッセージを表示
        } catch (error) {
            console.error(error); // コンソールにエラーを出力
            this.showToast('エラー', '問い合わせ送信中にエラーが発生しました', 'error'); // エラーメッセージを表示
        } finally {
            this.isLoading = false; // ローディング状態を終了
        }
    }

    // フォームのデータをリセット
    clearForm() {
        this.name = ''; // 名前をリセット
        this.email = ''; // メールをリセット
        this.phone = ''; // 電話番号をリセット
        this.category = ''; // カテゴリをリセット
        this.priority = ''; // 優先度をリセット
        this.description = ''; // 問い合わせ内容をリセット
        this.attachment = null; // 添付ファイルをリセット
        this.errors = {}; // エラーをリセット
    }

    // トーストメッセージを表示
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title, // トーストのタイトル
            message, // トーストのメッセージ
            variant // トーストの種類（success, error, info など）
        });
        this.dispatchEvent(event); // トーストイベントをディスパッチ
    }
}
