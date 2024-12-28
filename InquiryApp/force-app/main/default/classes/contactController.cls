public with sharing class contactController {
    @AuraEnabled(cacheable=true)
    public static String getGreeting(String name) {
        return 'Hello ' + name + '!';
    }
    
}