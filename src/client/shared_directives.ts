import {NgModule, Component, Injectable} from '@angular/core';
import {AgRendererComponent} from 'ag-grid-angular/main';

import * as Subscribe from './subscribe';
import * as Models from './models';

@Injectable()
export class FireFactory {
    constructor() {}

    public getFire = <T>(topic : string) : Subscribe.IFire<T> => {
        return new Subscribe.Fire<T>(topic);
    }
}

@Injectable()
export class SubscriberFactory {
    constructor() {}

    public getSubscriber = <T>(scope: any, topic: string): Subscribe.ISubscribe<T> => {
      return new EvalAsyncSubscriber<T>(scope, topic);
    }
}

class EvalAsyncSubscriber<T> implements Subscribe.ISubscribe<T> {
    private _wrapped: Subscribe.ISubscribe<T>;

    constructor(private _scope: any, topic: string) {
      this._wrapped = new Subscribe.Subscriber<T>(topic);
    }

    public registerSubscriber = (incrementalHandler: (msg: T) => void) => {
      return this._wrapped.registerSubscriber(x => this._scope.run(() => incrementalHandler(x)))
    };

    public registerConnectHandler = (handler : () => void) => {
        return this._wrapped.registerConnectHandler(() => this._scope.run(handler));
    };

    public registerDisconnectedHandler = (handler: () => void) => {
      return this._wrapped.registerDisconnectedHandler(() => this._scope.run(handler));
    };

    public get connected() { return this._wrapped.connected; }
}

@Component({
    selector: 'base-currency-cell',
    template: `{{ params.value | number:'1.4-4' }}`
})
export class BaseCurrencyCellComponent implements AgRendererComponent {
  private params:any;

  agInit(params:any):void {
    this.params = params;
  }

  refresh(): boolean {
      return false;
  }
}

@Component({
    selector: 'quote-currency-cell',
    template: `{{ params.value | currency:quoteSymbol:'symbol':'1.'+productFixed+'-'+productFixed }}`
})
export class QuoteCurrencyCellComponent implements AgRendererComponent {
  private params:any;
  private quoteSymbol:string = 'USD';
  private productFixed:number = 2;

  agInit(params:any):void {
    this.params = params;
    if ('quoteSymbol' in params.node.data)
      this.quoteSymbol = params.node.data.quoteSymbol.substr(0,3);
    if ('productFixed' in params.node.data)
      this.productFixed = params.node.data.productFixed;
  }

  refresh(): boolean {
      return false;
  }
}

@Component({
    selector: 'quote-untruncated-currency-cell',
    template: `{{ quoteSymbol }}{{ params.value }}`
})
export class QuoteUntruncatedCurrencyCellComponent implements AgRendererComponent {
  private params:any;
  private quoteSymbol:string = 'USD';

  agInit(params:any):void {
    this.params = params;
    if ('quoteSymbol' in params.node.data)
      this.quoteSymbol = params.node.data.quoteSymbol.substr(0,3).replace('USD','$').replace('EUR','€');
    if (!params.value)
      this.quoteSymbol = "";
    else params.value = parseFloat(params.value.toFixed(8));
  }

  refresh(): boolean {
      return false;
  }
}

@NgModule({
  providers: [
    SubscriberFactory,
    FireFactory
  ]
})
export class SharedModule {}
