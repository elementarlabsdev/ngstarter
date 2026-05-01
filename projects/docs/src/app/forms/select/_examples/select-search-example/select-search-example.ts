import { Component, signal } from '@angular/core';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Option, Select, SelectBody, SelectHeader } from '@ngstarter/components/select';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-select-search-example',
  imports: [
    FormField,
    Label,
    Option,
    Select,
    SelectHeader,
    SelectBody
  ],
  templateUrl: './select-search-example.html',
  styleUrl: './select-search-example.scss',
})
export class SelectSearchExample {
  foods = signal<Food[]>([
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
    { value: 'burger-3', viewValue: 'Burger' },
    { value: 'pasta-4', viewValue: 'Pasta' },
    { value: 'salad-5', viewValue: 'Salad' },
    { value: 'sushi-6', viewValue: 'Sushi' },
    { value: 'ramen-7', viewValue: 'Ramen' },
    { value: 'burrito-8', viewValue: 'Burrito' },
    { value: 'quesadilla-9', viewValue: 'Quesadilla' },
    { value: 'sandwich-10', viewValue: 'Sandwich' },
    { value: 'soup-11', viewValue: 'Soup' },
    { value: 'stew-12', viewValue: 'Stew' },
    { value: 'curry-13', viewValue: 'Curry' },
    { value: 'kebab-14', viewValue: 'Kebab' },
    { value: 'falafel-15', viewValue: 'Falafel' },
    { value: 'hummus-16', viewValue: 'Hummus' },
    { value: 'paella-17', viewValue: 'Paella' },
    { value: 'risotto-18', viewValue: 'Risotto' },
    { value: 'lasagna-19', viewValue: 'Lasagna' },
    { value: 'pancakes-20', viewValue: 'Pancakes' },
    { value: 'waffles-21', viewValue: 'Waffles' },
    { value: 'omelette-22', viewValue: 'Omelette' },
    { value: 'bacon-23', viewValue: 'Bacon' },
    { value: 'sausage-24', viewValue: 'Sausage' },
    { value: 'toast-25', viewValue: 'Toast' },
    { value: 'bagel-26', viewValue: 'Bagel' },
    { value: 'muffin-27', viewValue: 'Muffin' },
    { value: 'donut-28', viewValue: 'Donut' },
    { value: 'croissant-29', viewValue: 'Croissant' },
    { value: 'cake-30', viewValue: 'Cake' },
    { value: 'pie-31', viewValue: 'Pie' },
    { value: 'cookie-32', viewValue: 'Cookie' },
    { value: 'brownie-33', viewValue: 'Brownie' },
    { value: 'ice-cream-34', viewValue: 'Ice Cream' },
    { value: 'gelato-35', viewValue: 'Gelato' },
    { value: 'sorbet-36', viewValue: 'Sorbet' },
    { value: 'pudding-37', viewValue: 'Pudding' },
    { value: 'custard-38', viewValue: 'Custard' },
    { value: 'tart-39', viewValue: 'Tart' },
    { value: 'macaron-40', viewValue: 'Macaron' },
    { value: 'eclair-41', viewValue: 'Eclair' },
    { value: 'profiterole-42', viewValue: 'Profiterole' },
    { value: 'tiramisu-43', viewValue: 'Tiramisu' },
    { value: 'cheesecake-44', viewValue: 'Cheesecake' },
    { value: 'brownie-45', viewValue: 'Brownie' },
    { value: 'cupcake-46', viewValue: 'Cupcake' },
    { value: 'fudge-47', viewValue: 'Fudge' },
    { value: 'toffee-48', viewValue: 'Toffee' },
    { value: 'candy-49', viewValue: 'Candy' },
  ]);
}
