public with sharing class InquiryController {
    @AuraEnabled
    public static void createInquiry(String name, String email, String description) {
        Inquiry__c inquiry = new Inquiry__c(); // オブジェクト名のスペル修正
        inquiry.Name = name;                  // 変数名のスペル修正
        inquiry.Inquiry_address__c = email;
        inquiry.Inquiry_text__c = description;
        insert inquiry;
    }
}
