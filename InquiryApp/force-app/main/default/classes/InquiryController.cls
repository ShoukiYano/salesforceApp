public with sharing class InquiryController {
    // `InquiryController` というクラスを定義。
    // `with sharing` は、このクラスが実行される際に、現在のユーザーの共有設定（アクセス権限）を考慮することを指定。

    @AuraEnabled
    // このメソッドをLightning Web Components（LWC）やAuraコンポーネントから呼び出せるようにするアノテーション。

    public static void createInquiry(
        String name,         // 名前
        String email,        // メールアドレス
        String phone,        // 電話番号
        String category,     // カテゴリ（選択リスト値）
        String priority,     // 優先度（選択リスト値）
        String description,  // 問い合わせ内容
        String attachment,   // 添付ファイル名
        Datetime inquiryDate // 問い合わせ日時
    ) {
        // LWCから渡された問い合わせフォームのデータを引数として受け取るメソッドを定義。

        Inquiry__c inquiry = new Inquiry__c();
        // Salesforceのカスタムオブジェクト `Inquiry__c` の新しいインスタンスを作成。

        // 各フィールドを設定
        inquiry.Name = name;                      
        // 問い合わせの「名前」フィールドにフォームからの入力値を設定。

        inquiry.Inquiry_address__c = email;       
        // 問い合わせの「メールアドレス」カスタムフィールドにフォームからの入力値を設定。

        inquiry.Phone__c = phone;                 
        // 問い合わせの「電話番号」カスタムフィールドにフォームからの入力値を設定。

        inquiry.Category__c = category;           
        // 問い合わせの「カテゴリ」カスタムフィールドにフォームからの選択値を設定。
        // 選択リスト値が有効である必要があります。

        inquiry.Priority__c = priority;           
        // 問い合わせの「優先度」カスタムフィールドにフォームからの選択値を設定。
        // 選択リスト値が有効である必要があります。

        inquiry.Inquiry_text__c = description;     
        // 問い合わせの「内容」カスタムフィールドにフォームからの入力値を設定。

        inquiry.Attachment__c = attachment;       
        // 問い合わせの「添付ファイル名」カスタムフィールドにアップロードされたファイル名を設定。

        inquiry.Inquiry_Date__c = inquiryDate;    
        // 問い合わせの「日時」カスタムフィールドに現在日時を設定。

        insert inquiry;
        // Salesforceデータベースに問い合わせレコードを挿入。
    }
}
