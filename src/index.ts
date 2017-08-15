import * as T from "babel-types";
import traverse, {Binding, NodePath} from "babel-traverse";
import collectPropertyTypes from './classes/class-props';
import get = require("lodash/get");


function generateLibdefs({ types: t }: { types: typeof T }) {
  const isDeclaration = (x: any) => t.isDeclaration(x);

  return {
    visitor: {
      Program: {
        exit(path: NodePath<T.Program>, state: any) {
          const moduleName = get(state, ['opts', 'moduleIdentifier'], 'someModule');
          const declaredMod = t.declareModule(t.identifier(moduleName), t.blockStatement(
            path.node.body.filter(isDeclaration)
          ))
          path.node.body = [declaredMod];
        }
      },
      ClassDeclaration(path: NodePath<T.ClassDeclaration>) {
        const ident = path.node.id;
        const {leadingComments, body: originalBody} = path.node;
        const name = ident.name;
        const prop = t.objectTypeProperty(
          path.scope.generateUidIdentifier('someProp'),
          t.stringTypeAnnotation()
        );
        const decl = t.declareClass(
          ident,
          path.node.typeParameters,
          path.node.superClass ? [t.interfaceExtends(path.node.superClass as T.Identifier)] : [],
          t.objectTypeAnnotation(
            collectPropertyTypes(originalBody.body), [], []
          )
        );

        path.replaceWith(decl);
        if (leadingComments && leadingComments.length) {
          path.addComments('leading', leadingComments);
        }
        path.skip();
      }
    }
  };
}

module.exports = generateLibdefs;
