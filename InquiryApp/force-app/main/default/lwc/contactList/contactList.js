// ApexのfetchContactsメソッドとupdateContactsメソッドを使うためにインポート
import fetchContacts from '@salesforce/apex/CustomContactController.fetchContacts';
import updateContacts from '@salesforce/apex/CustomContactController.updateContacts';

// Lightning Web Component (LWC) を作るために必要な部品をインポート
import { LightningElement, wire, track } from 'lwc';

// クラスの定義（ContactListという名前のコンポーネント）
export default class ContactList extends LightningElement {
    @track contacts = []; // すべての連絡先データを入れる
    @track filteredContacts = []; // 検索した後のデータを入れる
    @track paginatedContacts = []; // ページごとのデータを入れる
    @track searchKey = ''; // ユーザーが検索ボックスに入力した文字を保存する

    @track currentPage = 1; // 現在のページ番号を保存
    @track totalPages = 1; // 全部で何ページあるか保存
    @track pageSize = 5; // 1ページに表示するデータの件数

    @track isFirstPage = true; // 「前へ」ボタンを押せるかどうか（最初のページでは押せない）
    @track isLastPage = false; // 「次へ」ボタンを押せるかどうか（最後のページでは押せない）

    @track sortedBy = 'FirstName';
    @track sortedDirection = 'asc';

    // データテーブルに表示する列（カラム）の設定
    @track columns = [
        { label: 'FirstName', fieldName: 'FirstName', editable: true, sortable: true }, // 名
        { label: 'LastName', fieldName: 'LastName', editable: true, sortable: true },   // 姓
        { label: 'Email', fieldName: 'Email', editable: true, sortable: true }         // メールアドレス
    ];

    // Apexから連絡先データを取得する（@wireで自動的にデータが取得される）
    @wire(fetchContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = JSON.parse(JSON.stringify(data));
            this.filteredContacts = [...this.contacts]; // filteredContacts にコピーを設定
            this.calculatePagination(); // ページネーションを計算
            console.log('Contacts:', this.contacts);
            console.log('Filtered Contacts:', this.filteredContacts);
        } else if (error) {
            console.error(error); // エラーがあれば表示
        }
    }

    // ソートイベントを処理
    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
        this.sortData(sortedBy, sortDirection);
        this.updatePaginatedContacts();
    }

    sortData(fieldName, sortDirection) {
        const isAscending = sortDirection === 'asc';
        this.filteredContacts.sort((a, b) => {
            const valA = a[fieldName] ? a[fieldName].toLowerCase() : '';
            const valB = b[fieldName] ? b[fieldName].toLowerCase() : '';
            return isAscending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }

    // ページの計算をする関数
    calculatePagination() {
        const totalRecords = this.filteredContacts.length; // データの総件数を取得
        this.totalPages = Math.ceil(totalRecords / this.pageSize); // 全ページ数を計算
        this.currentPage = Math.min(this.currentPage, this.totalPages); // ページが範囲外にならないようにする
        this.updatePaginatedContacts(); // 現在のページのデータを更新する
    }

    // 現在のページに表示するデータを更新する
    updatePaginatedContacts() {
        const startIdx = (this.currentPage - 1) * this.pageSize;
        const endIdx = this.currentPage * this.pageSize;
        this.paginatedContacts = this.filteredContacts.slice(startIdx, endIdx);

        // 「前へ」ボタンと「次へ」ボタンの有効/無効を設定
        this.isFirstPage = this.currentPage === 1;
        this.isLastPage = this.currentPage === this.totalPages;
    }

    // 「前へ」ボタンが押されたときの処理
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--; // ページ番号を1つ減らす
            this.updatePaginatedContacts(); // ページのデータを更新
        }
    }

    // 「次へ」ボタンが押されたときの処理
    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++; // ページ番号を1つ増やす
            this.updatePaginatedContacts(); // ページのデータを更新
        }
    }

    // テーブルのデータを保存する処理
    async handleSave(event) {
        const updatedFields = event.detail.draftValues; // 編集されたデータを取得

        try {
            // Apexメソッドでデータを保存
            await updateContacts({ contactsToUpdate: updatedFields });

            // 成功メッセージを表示
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contacts updated successfully!',
                    variant: 'success'
                })
            );

            // データを再取得してリストを更新
            this.contacts = await fetchContacts();
        } catch (error) {
            console.error('Error updating contacts: ', error); // エラーが発生した場合
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error updating contacts. Please try again.',
                    variant: 'error'
                })
            );
        }
    }

    // Enterキーが押されたときの処理
    handleKeyDown(event) {
        if (event.key === 'Enter') { // Enterキーを押したかどうか確認
            console.log('Enterが押されました');
            this.handleSearchChange(); // 検索処理を呼び出す
        }
    }

    // 検索文字列に応じてデータをフィルタリングする
    handleSearchChange(event) {
        const searchKey = (event.target.value || '').toLowerCase(); // 検索文字列を取得
        this.filteredContacts = this.contacts.filter(contact => {
            // フィールド名をすべて検索対象とする
            const firstName = contact.FirstName ? contact.FirstName.toLowerCase() : '';
            const lastName = contact.LastName ? contact.LastName.toLowerCase() : '';
            const email = contact.Email ? contact.Email.toLowerCase() : '';
    
            // 各フィールドに検索文字列が含まれるか判定
            return firstName.includes(searchKey) || lastName.includes(searchKey) || email.includes(searchKey);
        });
        this.calculatePagination(); // ページネーションを再計算
        console.log('Filtered Contacts after Search:', this.filteredContacts); // 検索結果を確認
    }
    
}
