public with sharing class CustomContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> fetchContacts() {
        return [SELECT Id, FirstName, LastName, Email FROM Contact];
    }

    @AuraEnabled
    public static void updateContacts(List<Contact> contactsToUpdate) {
        try {
            System.debug('Contacts to update: ' + contactsToUpdate);
            update contactsToUpdate;
        } catch (DmlException e) {
            throw new AuraHandledException('Error updating contacts: ' + e.getMessage());
        }
    }
}