import { Component, input } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { RouterLink } from '@angular/router';

export interface Transaction {
  createdAt: string;
  status: 'cancelled' | 'approved';
  to: {
    amount: number;
    currency: string;
  },
  from: {
    amount: number;
    currency: string;
  },
  sender: {
    id: string | number;
    name: string;
  };
  recipient: {
    id: string | number;
    name: string;
  }
}

@Component({
    selector: 'ngs-transactions-content',
    imports: [
        Icon,
        RouterLink
    ],
    templateUrl: './transactions-widget.html',
    styleUrl: './transactions-widget.scss'
})
export class TransactionsWidget {
  transactions = input<Transaction[]>([]);
}
